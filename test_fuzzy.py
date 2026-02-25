import pandas as pd
from io import StringIO
from src.utils.csv_loader import _normalise_columns

def test_fuzzy_mapping():
    # Simulate a Shopify-style CSV
    data = """Order Number,Product SKU,Qty,Unit Price,Date
    #1001,SKU-A,2,15.00,2024-01-01
    #1002,SKU-B,1,50.00,2024-01-02
    """
    df = pd.read_csv(StringIO(data))
    df_norm = _normalise_columns(df)
    
    print("Normalised columns:", list(df_norm.columns))
    
    expected = {"order_id", "sku", "quantity", "item_price", "order_date"}
    missing = expected - set(df_norm.columns)
    
    if not missing:
        print("SUCCESS: All columns mapped correctly!")
    else:
        print(f"FAILED: Missing columns {missing}")

if __name__ == "__main__":
    test_fuzzy_mapping()
