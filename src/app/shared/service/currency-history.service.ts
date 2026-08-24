import { Injectable } from '@angular/core';
import { PeriodicHistoryElement } from './currency-exchange.service';
import { StorageService } from './storage.service';
import { LocalStorageItems } from '../interface/enums.model';

@Injectable({ providedIn: 'root' })
export class CurrencyHistoryService {
    private idCounter = new Date().getTime();

    loadHistory(): PeriodicHistoryElement[] {
        return (<PeriodicHistoryElement[]>StorageService.getObject('exchangeRates')) || [];
    }

    createHistoryElement(params: {
        fromCurrency: string;
        toCurrency: string;
        fromRate: number;
        toRate: number;
        amount: number;
        getCurrentDate: (sep: string) => string;
        getCurrentTime: (sep: string) => string;
    }): PeriodicHistoryElement {
        this.idCounter += 1;

        const pairRate = Number((params.toRate / params.fromRate).toFixed(5));

        return {
            id: this.idCounter,
            date: `${params.getCurrentDate('/')}\n@${params.getCurrentTime(':')}`,
            time: params.getCurrentTime(':'),
            exchangeRate: `${params.fromCurrency} → ${params.toCurrency}\n${pairRate}`,
            pureExchangeRate: pairRate,
            creationDate: params.getCurrentDate('/'),
            fromCurrency: params.fromCurrency,
            toCurrency: params.toCurrency,
            amount: params.amount,
        };
    }

    saveHistory(history: PeriodicHistoryElement[]): void {
        StorageService.setObject(LocalStorageItems.ExchangeRates, [...history]);
    }

    removeItem(history: PeriodicHistoryElement[], element: PeriodicHistoryElement): PeriodicHistoryElement[] {
        return history.filter((item) => item.id !== element.id);
    }
}
