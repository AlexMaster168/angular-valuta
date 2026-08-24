import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { MatOptionSelectionChange } from '@angular/material/core';

import { ExchangeRatesApiRequestService } from '../../shared/service/exchange-rates-api-request.service';
import { AlertService } from '../../core/alert/alert.service';
import { CurrencyExchangeService, PeriodicHistoryElement } from '../../shared/service/currency-exchange.service';
import { CurrencyCalculatorService } from '../../shared/service/currency-calculator.service';
import { CurrencyAutocompleteService } from '../../shared/service/currency-autocomplete.service';
import { CurrencyHistoryService } from '../../shared/service/currency-history.service';
import { ConverterFormService } from '../../shared/service/converter-form.service';
import { CurrencySymbolService } from '../../shared/service/currency-symbol.service';
import { ExchangeRatesResponse, MappedCurrencyRateObject } from '../../shared/interface/exchange-rates.model';
import { FormNames, TableColumnNames, Currency } from '../../shared/interface/enums.model';

@Component({
    selector: 'app-converter',
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
})
export class ConverterComponent implements OnInit {
    dataSource: MatTableDataSource<PeriodicHistoryElement>;
    displayedHistoricalColumns: string[] = [TableColumnNames.Date, TableColumnNames.ExchangeRate];

    converterForm: UntypedFormGroup;
    filteredFromValues: Observable<string[]>;
    filteredToValues: Observable<string[]>;

    amount: number;
    fromRate: number;
    fromCurrency: string;
    toRate: number;
    toCurrency: string;
    result: string;

    constructor(
        public currencyExchangeService: CurrencyExchangeService,
        private apiRequestService: ExchangeRatesApiRequestService,
        private alertService: AlertService,
        private calculator: CurrencyCalculatorService,
        private autocomplete: CurrencyAutocompleteService,
        private historyService: CurrencyHistoryService,
        private formService: ConverterFormService,
        private symbolService: CurrencySymbolService,
    ) {}

    ngOnInit() {
        this.converterForm = this.currencyExchangeService.converterForm;
        this.dataSource = new MatTableDataSource(this.currencyExchangeService.periodicHistoryExchangeRates);

        this.formService.setControlsEnabled(this.converterForm, [FormNames.FromControl, FormNames.ToControl], false);

        this.loadRates();
        this.setupAutocomplete();
        this.setupAmountValidation();

        if (this.currencyExchangeService.isServiceReferral) {
            this.currencyExchangeService.toggleServiceReferral();
            this.restoreFormState();
            this.validateForm();
        }
    }

    selectCurrencyByClick(selectedOption: string, formControlName: string) {
        this.converterForm.controls[formControlName].setValue(selectedOption);
        this.validateForm();
    }

    selectCurrencyByEnter(event: MatOptionSelectionChange, inputName: string): void {
        if (event.isUserInput) {
            this.converterForm.controls[inputName].setValue(event.source.value);
        }
    }

    selectWrittenCurrency(event: any, inputName: string): void {
        const written = event.target.value.toUpperCase();
        const currencies = this.autocomplete.mapCurrencies(this.currencyExchangeService.fromCurrencies);
        const match = this.autocomplete.findMatch(currencies, written);

        if (written.length === 3 && match) {
            this.converterForm.controls[inputName].setValue(match);
        }

        this.validateForm();
    }

    exchangeRates(): void {
        this.fromRate = this.getRateForControl(FormNames.FromControl);
        this.fromCurrency = this.getCurrencyForControl(FormNames.FromControl);
        this.toRate = this.getRateForControl(FormNames.ToControl);
        this.toCurrency = this.getCurrencyForControl(FormNames.ToControl);
        this.amount = Math.floor(this.converterForm.get(FormNames.AmountControl).value);

        this.result = this.calculator.calculateExchangeRate(this.amount, this.fromRate, this.toRate);

        const element = this.historyService.createHistoryElement({
            fromCurrency: this.fromCurrency,
            toCurrency: this.toCurrency,
            fromRate: this.fromRate,
            toRate: this.toRate,
            amount: this.amount,
            getCurrentDate: (sep) => this.currencyExchangeService.getCurrentDate(sep),
            getCurrentTime: (sep) => this.currencyExchangeService.getCurrentTime(sep),
        });

        this.currencyExchangeService.periodicHistoryExchangeRates.unshift(element);
        this.historyService.saveHistory(this.currencyExchangeService.periodicHistoryExchangeRates);
        this.dataSource = new MatTableDataSource(this.currencyExchangeService.periodicHistoryExchangeRates);
    }

    changeExchangeInputValues(): void {
        this.converterForm = this.formService.swapControls(this.converterForm);
        this.currencyExchangeService.fromCurrencies = this.autocomplete.mapCurrencies(this.currencyExchangeService.exchangeRates?.map((r) => r.currency) ?? []);
        this.currencyExchangeService.toCurrencies = this.currencyExchangeService.fromCurrencies;
        this.setupAutocomplete();
    }

    setFormValidity(): void {
        this.validateForm();
    }

    getSymbol(rate: string): string {
        return this.symbolService.getSymbol(rate);
    }

    private loadRates(): void {
        if (this.currencyExchangeService.exchangeRates) {
            this.formService.setControlsEnabled(this.converterForm, [FormNames.FromControl, FormNames.ToControl], true);
            return;
        }

        this.apiRequestService.getExchangeRates(Currency.USD).subscribe({
            next: (response: ExchangeRatesResponse) => {
                this.currencyExchangeService.exchangeRates = this.calculator.mapResponseData(response);
                this.currencyExchangeService.fromCurrencies = this.autocomplete.mapCurrencies(
                    this.currencyExchangeService.exchangeRates.map((r) => r.currency),
                );
                this.currencyExchangeService.toCurrencies = [...this.currencyExchangeService.fromCurrencies];
                this.formService.setControlsEnabled(this.converterForm, [FormNames.FromControl, FormNames.ToControl], true);
            },
            error: (err) => this.alertService.error(`Error: ${err.message}`),
        });
    }

    private setupAutocomplete(): void {
        this.filteredFromValues = this.autocomplete.observeFiltered(
            this.converterForm.get(FormNames.FromControl),
            this.currencyExchangeService.fromCurrencies,
        );
        this.filteredToValues = this.autocomplete.observeFiltered(
            this.converterForm.get(FormNames.ToControl),
            this.currencyExchangeService.toCurrencies,
        );
    }

    private setupAmountValidation(): void {
        this.converterForm.get('amountControl').valueChanges.subscribe((value: number) => {
            this.formService.clampNegative(this.converterForm, 'amountControl', value);
        });
    }

    private validateForm(): void {
        const hasAmount = !!this.converterForm.controls['amountControl'].value;
        const fromValid = this.autocomplete.isExactMatch(this.currencyExchangeService.fromCurrencies, this.converterForm.get(FormNames.FromControl).value);
        const toValid = this.autocomplete.isExactMatch(this.currencyExchangeService.toCurrencies, this.converterForm.get(FormNames.ToControl).value);

        this.currencyExchangeService.isValid = hasAmount && fromValid && toValid;
    }

    private restoreFormState(): void {
        const controls = [FormNames.AmountControl, FormNames.ToControl, FormNames.FromControl];
        for (const name of controls) {
            const value = this.converterForm.controls[name].value;
            if (value && value.length === 3) {
                const currencies = this.autocomplete.mapCurrencies(this.currencyExchangeService.fromCurrencies);
                const match = this.autocomplete.findMatch(currencies, value);
                if (match) {
                    this.converterForm.controls[name].setValue(match);
                }
            }
        }
    }

    private getRateForControl(name: string): number {
        const currency = this.converterForm.get(name).value;
        return this.calculator.filterByCurrency(this.currencyExchangeService.exchangeRates, currency)?.rate;
    }

    private getCurrencyForControl(name: string): string {
        return this.converterForm.get(name).value;
    }
}
