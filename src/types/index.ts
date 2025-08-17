import { IEvents } from "../components/base/events";
import { IProduct } from "../components/Card";


export interface IOrderForm {
    email: string;
    phone: string;
    address: string;
    payment: string;
    total: number; 
}

export interface IAppState {
    catalog: IProduct[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}

export interface IOrder extends IOrderForm {
    items: string[]
}

export type CardUpdate = Pick<IProduct, 'title' | 'price'| 'id'>;

export type PaymentModal = Pick<IOrderForm, 'address' | 'payment'>;

export type ContactsModal = Pick<IOrderForm, 'phone' | 'email'>;

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
    id: string;
}