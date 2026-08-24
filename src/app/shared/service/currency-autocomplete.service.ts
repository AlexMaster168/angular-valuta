import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AbstractControl } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class CurrencyAutocompleteService {
    mapCurrencies(currencyNames: string[]): string[] {
        return [...currencyNames].sort();
    }

    findMatch(currencies: string[], input: string): string | undefined {
        const upper = input.toUpperCase();
        return currencies.find((c) => c.includes(upper));
    }

    isExactMatch(currencies: string[], value: string): boolean {
        return currencies.some((c) => c === value.toUpperCase());
    }

    observeFiltered(control: AbstractControl, allCurrencies: string[]): Observable<string[]> {
        return control.valueChanges.pipe(
            startWith(''),
            map((value: string) => this.filterByInput(value, allCurrencies)),
        );
    }

    filterByInput(value: string, options: string[]): string[] {
        const filterValue = value.toLowerCase();
        return options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
