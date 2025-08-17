import { Form } from '../components/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/events';


export class Order extends Form<IOrderForm> {

	protected cashButton: HTMLButtonElement | null;
	protected cardButton: HTMLButtonElement | null;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		const cash = this.container.querySelector('[name = "cash"]');
		const card = this.container.querySelector('[name = "card"]');

		this.cashButton = cash instanceof HTMLButtonElement ? cash : null;
		this.cardButton = card instanceof HTMLButtonElement ? card : null;

		if (this.cashButton) {
			this.cashButton.addEventListener('click', () => {
				this.events.emit('order.payment:change', {
					field: 'payment',
					value: 'cash'
				});
				this.togglePayment('cash');
			});
		}

		if (this.cardButton) {
			this.cardButton.addEventListener('click', () => {
				this.events.emit('order.payment:change', {
					field: 'payment',
					value: 'card'
				});
				this.togglePayment('card');
			});
		}
	}


	set phone(value: string) {
		const phoneInput = this.container.elements.namedItem('phone');

		if (phoneInput && phoneInput instanceof HTMLInputElement) {
			phoneInput.value = value;
		}
	}

	set email(value: string) {
		const emailInput = this.container.elements.namedItem('email');

		if (emailInput && emailInput instanceof HTMLInputElement) {
			emailInput.value = value;
		}
	}

	set address(value: string) {
		const addressInput = this.container.elements.namedItem('address');

		if (addressInput && addressInput instanceof HTMLInputElement) {
			addressInput.value = value;
		}
	}

    togglePayment(method: 'cash' | 'card') {
		if (!this.cashButton || !this.cardButton) {
			return;
		}
		if (method === 'cash') {
			this.toggleClass(this.cashButton, 'button_alt-active', true);
			this.toggleClass(this.cardButton, 'button_alt-active', false);
		} else {
			this.toggleClass(this.cashButton, 'button_alt-active', false);
			this.toggleClass(this.cardButton, 'button_alt-active', true);
		}
	}
}
