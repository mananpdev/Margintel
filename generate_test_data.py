import csv
import random
import uuid
from datetime import datetime, timedelta

def generate_data(num_orders=300, num_returns=80):
    skus = [
        ("SKU-PRO-MAX", 599.99, 0.05), # High value, low return
        ("SKU-ECO-BUDGET", 19.99, 0.25), # Low value, high return
        ("SKU-MOD-TREND", 49.99, 0.12), # Medium value, medium return
        ("SKU-DELUXE-KIT", 129.50, 0.08),
        ("SKU-BASIC-TOOL", 35.00, 0.15)
    ]
    
    reasons = [
        "Item arrived damaged",
        "Wrong size received",
        "Product quality not as expected",
        "Changed my mind",
        "Found a better price",
        "Defective unit",
        "Sizing chart was misleading",
        "Arrived too late",
        "Missing parts",
        "Doesn't match description"
    ]

    orders = []
    returns = []
    
    start_date = datetime(2025, 1, 1)
    
    # Generate Orders
    for i in range(num_orders):
        order_id = 2000 + i
        order_date = (start_date + timedelta(days=random.randint(0, 60))).strftime("%Y-%m-%d")
        sku_info = random.choice(skus)
        sku = sku_info[0]
        price = sku_info[1]
        quantity = random.randint(1, 3)
        discount = random.choice([0, 0, 0, 5, 10, 15, 20]) if price > 50 else 0
        refund_amount = 0.0
        
        orders.append({
            "order_id": order_id,
            "order_date": order_date,
            "sku": sku,
            "quantity": quantity,
            "item_price": price,
            "discount_amount": discount,
            "refund_amount": refund_amount
        })

    # Generate Returns from existing orders
    random.shuffle(orders)
    for order in orders:
        if len(returns) >= num_returns:
            break
            
        sku = order["sku"]
        sku_info = next(s for s in skus if s[0] == sku)
        
        # Increase probability for specific SKUs to create "risk" signals
        prob = sku_info[2] * 3
        if random.random() < prob:
            return_date = (datetime.strptime(order["order_date"], "%Y-%m-%d") + timedelta(days=random.randint(1, 14))).strftime("%Y-%m-%d")
            reason = random.choice(reasons)
            amount = order["item_price"] * order["quantity"] - order["discount_amount"]
            
            returns.append({
                "order_id": order["order_id"],
                "sku": sku,
                "return_date": return_date,
                "return_reason_text": reason,
                "return_amount": amount
            })
            order["refund_amount"] = amount

    # Write to CSV files
    with open('test_orders.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=orders[0].keys())
        writer.writeheader()
        writer.writerows(orders)

    with open('test_returns.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=returns[0].keys())
        writer.writeheader()
        writer.writerows(returns)

    print(f"Generated {len(orders)} orders in test_orders.csv")
    print(f"Generated {len(returns)} returns in test_returns.csv")

if __name__ == "__main__":
    generate_data()
