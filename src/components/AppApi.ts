import { Api, ApiListResponse } from './base/api';
import {IOrder, IOrderResult,CardUpdate,} from "../types";
import { CardItem } from "./AppData";

export interface IAppAPI {
    getProductList: () => Promise<CardItem[]>;
    getProductItem: (id: string) => Promise<CardItem>;
    getProductUpdate: (id: string) => Promise<CardUpdate>
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

export class CatalogAPI extends Api implements IAppAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProductItem(id: string): Promise<CardItem> {
        return this.get(`/product/${id}`).then(
            (item: CardItem) => ({
                ...item,
                image: this.cdn + item.image,
            })
        );
    }

    getProductUpdate(id: string): Promise<CardUpdate> {
        return this.get(`/product/${id}`).then(
            (data: CardUpdate) => data
        );
    }

    getProductList(): Promise<CardItem[]> {
        return this.get('/product').then((data: ApiListResponse<CardItem>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    orderProducts(order: IOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    }

}