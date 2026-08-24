import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

import { MappedCurrencyRateObject } from '../interface/exchange-rates.model';
import { StorageService } from './storage.service';

export interface PeriodicHistoryElement {
    id: number;
    date: string;
    time: string;
    exchangeRate: string;
    pureExchangeRate?: number;
    creationDate?: string;
    fromCurrency?: string;
    toCurrency?: string;
    amount?: number;
}

@Injectable()
export class CurrencyExchangeService {
    converterForm: UntypedFormGroup = new UntypedFormGroup({
        amountControl: new UntypedFormControl('', [Validators.required]),
        fromControl: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
        toControl: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
    });

    exchangeRates: MappedCurrencyRateObject[];
    periodicHistoryExchangeRates: PeriodicHistoryElement[] =
        <PeriodicHistoryElement[]>StorageService.getObject('exchangeRates') || [];

    fromCurrencies: string[] = [];
    toCurrencies: string[] = [];

    isValid = false;
    isServiceReferral = false;

    toggleServiceReferral(): void {
        this.isServiceReferral = !this.isServiceReferral;
    }

    getCurrentDate(separator: string): string {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${day}${separator}${month}${separator}${year}`;
    }

    getCurrentTime(separator: string): string {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}${separator}${minutes}${separator}${seconds}`;
    }
}
