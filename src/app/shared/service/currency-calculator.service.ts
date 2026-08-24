import { Injectable } from '@angular/core';
import { MappedCurrencyRateObject, ExchangeRatesResponse } from '../interface/exchange-rates.model';

@Injectable({ providedIn: 'root' })
export class CurrencyCalculatorService {
    calculateExchangeRate(amount: number, fromRate: number, toRate: number): string {
        return ((amount * toRate) / fromRate).toFixed(3);
    }

    calculatePairRate(fromRate: number, toRate: number): number {
        return Number((toRate / fromRate).toFixed(5));
    }

    calculateAverageRate(rates: number[]): number {
        if (rates.length === 0) return 0;
        const sum = rates.reduce((acc, current) => acc + current, 0);
        return Number((sum / rates.length).toFixed(5));
    }

    mapResponseData(responseData: ExchangeRatesResponse): MappedCurrencyRateObject[] {
        return Object.keys(responseData.rates).map(
            (item: string): MappedCurrencyRateObject => ({
                currency: item,
                rate: responseData.rates[item],
            }),
        );
    }

    filterByCurrency(rates: MappedCurrencyRateObject[], currency: string): MappedCurrencyRateObject | undefined {
        return rates.find((item) => item.currency === currency);
    }
}
