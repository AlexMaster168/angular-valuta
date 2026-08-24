import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FormNames } from '../interface/enums.model';

@Injectable({ providedIn: 'root' })
export class ConverterFormService {
    createForm(): UntypedFormGroup {
        return new UntypedFormGroup({
            [FormNames.AmountControl]: new UntypedFormControl('', [Validators.required]),
            [FormNames.FromControl]: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
            [FormNames.ToControl]: new UntypedFormControl('', [Validators.required, Validators.minLength(2)]),
        });
    }

    swapControls(form: UntypedFormGroup): UntypedFormGroup {
        return new UntypedFormGroup({
            [FormNames.AmountControl]: new UntypedFormControl(form.get(FormNames.AmountControl).value, [
                Validators.required,
            ]),
            [FormNames.FromControl]: new UntypedFormControl(form.get(FormNames.ToControl).value, [
                Validators.required,
                Validators.minLength(2),
            ]),
            [FormNames.ToControl]: new UntypedFormControl(form.get(FormNames.FromControl).value, [
                Validators.required,
                Validators.minLength(2),
            ]),
        });
    }

    setControlsEnabled(form: UntypedFormGroup, names: string[], enabled: boolean): void {
        for (const name of names) {
            const control = form.controls[name];
            enabled ? control.enable() : control.disable();
        }
    }

    clampNegative(form: UntypedFormGroup, controlName: string, value: number): void {
        if (value < 0) {
            form.controls[controlName].setValue(0);
        }
    }
}
