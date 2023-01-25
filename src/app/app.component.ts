import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

const API = 'http://localhost:8000/products';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public products: Item[] = [];
  public alternativeItems: AlternateItem[] = [];
  public selectedItem?: Item;


  constructor(private http: HttpClient) {
    this._loadData();
  }

  private _loadData() {
    this.http.get(API)
      .subscribe(
        (data: any) => {
          const items: Item[] = data.items;
          this.products = items.filter(e => e.to_order_qty && e.to_order_qty > 0);
          //alternate
          const alt = data.alt;
          items.forEach(e => {
            const alt: AlternateItem[] = [];
            for (let i = 0; i < 2; i++) {
              alt.push(new AlternateItem(e.id + '00' + i, e.itemDescription, 1, e.price_per_unit));
            }
            map.set(e.id, alt);
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  public increase(item: Item) {
    if (!item.to_order_qty) {
      // item.to_order_qty = 1;
      this.onDelete(item);
    } else if (item.to_order_qty >= 50) {
      return;
    } else {
      item.to_order_qty += 1;
    }
  }

  public decrease(item: Item) {
    item.to_order_qty -= 1;
    if (!item.to_order_qty) {
      // item.to_order_qty = 0;
      this.onDelete(item);
    } else if (item.to_order_qty <= 0) {
      // item.to_order_qty = 0;
      this.onDelete(item);
    }
  }

  public getTotalAmount() {
    let qty = 0;
    let amount = 0;
    this.products.forEach(e => {
      qty += e.to_order_qty;
      amount += e.price_per_unit * e.to_order_qty;
    });
    return amount;
  }

  public onChange(item: Item) {
    console.log(item);
    if (item) {
      this.alternativeItems = map.get(item.id) || [];
    } else {
      this.alternativeItems = [];
    }
  }

  public onSelect(item: AlternateItem) {
    console.log(item);
    if (item && this.selectedItem) {
      const index = this.products.findIndex(e => e.id === this.selectedItem!.id && e.cust_id === this.selectedItem!.cust_id);
      if (index != -1) {
        this.products.splice(index, 1, new Item(this.selectedItem!.cust_id, item.id, item.itemDescription, 1, item.price_per_unit));
      }
    }

  }

  public onDelete(item: Item) {
    if (item) {
      const index = this.products.findIndex(e => e.id === item.id && e.cust_id === item.cust_id);
      if (index != -1) {
        this.products.splice(index, 1);
      }
    }
  }

  public onSave() {
    this._downloadFile(this.products);
  }

  private _downloadFile(data: any) {
    this.http.post(API, data).subscribe(data => {
      console.log(data); 
      this._loadData();
    });
  }
}

export class Item {
  cust_id: string;
  id: string;
  itemDescription: string;
  to_order_qty: number;
  price_per_unit: number;

  constructor(cust_id: string, id: string, itemDescription: string, to_order_qty: number, price_per_unit: number) {
    this.cust_id = cust_id;
    this.id = id;
    this.itemDescription = itemDescription;
    this.to_order_qty = to_order_qty;
    this.price_per_unit = price_per_unit;
  }
}

export class AlternateItem {
  id: string;
  itemDescription: string;
  to_order_qty: number;
  price_per_unit: number;

  constructor(id: string, itemDescription: string, to_order_qty: number, price_per_unit: number) {
    this.id = id;
    this.itemDescription = itemDescription;
    this.to_order_qty = to_order_qty;
    this.price_per_unit = price_per_unit;
  }
}
const map = new Map<string, AlternateItem[]>([]);