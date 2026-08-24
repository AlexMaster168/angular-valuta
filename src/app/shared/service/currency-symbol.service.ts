import { Injectable } from '@angular/core';
import getSymbolFromCurrency from 'currency-symbol-map';

@Injectable({ providedIn: 'root' })
export class CurrencySymbolService {
    getSymbol(currencyCode: string): string {
        return getSymbolFromCurrency(currencyCode);
    }
}
