import { Form } from '../components/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/events';


export class Order extends Form<IOrderForm> {

    protected cashButton: HTMLButtonElement;
    protected cardButton: HTMLButtonElement;
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

    set togglePayment(value: boolean) {
        const cashButton = this.container.querySelector('#cash') as HTMLButtonElement;
		const cardButton = this.container.querySelector('#card') as HTMLButtonElement;
        this.toggleClass(cashButton, 'active', !value);
        this.toggleClass(cardButton, 'active', value);
        this.setDisabled(cashButton, !value);
        this.setDisabled(cardButton, value);
}
}
