
import streamlit as st
import pandas as pd
import os

st.title("📊 מערכת דוחות – קובץ פלט מאוחד")

raw_file = st.file_uploader("📥 העלה קובץ Raw Data (לידים והמרות)", type=["csv", "xlsx"])
rates_file = st.file_uploader("📥 העלה קובץ Rates (2 גיליונות: Affiliate, Brand)", type=["xlsx"])
payments_file = st.file_uploader("📥 העלה קובץ Manual Payments", type=["xlsx"])

if raw_file and rates_file and payments_file:
    st.success("✅ כל הקבצים נטענו בהצלחה")

    # Load raw data
    if raw_file.name.endswith("csv"):
        raw = pd.read_csv(raw_file)
    else:
        raw = pd.read_excel(raw_file)

    # Load rates
    aff_rates = pd.read_excel(rates_file, sheet_name="Affiliate Rates")
    brand_rates = pd.read_excel(rates_file, sheet_name="Brand Rates")

    # Load payments
    money_out = pd.read_excel(payments_file, sheet_name="Money Out")
    money_in = pd.read_excel(payments_file, sheet_name="Money In")

    # Placeholder logic
    cost_df = aff_rates[["Affiliate", "Country", "CPA to Pay", "Guarantee", "Deal Type"]].copy()
    income_df = brand_rates[["Brand", "Country", "CPA to Collect", "Guarantee", "Deal Type"]].copy()

    # Add dummy values
    cost_df["Leads"] = [50] * len(cost_df)
    cost_df["FTDs"] = [5] * len(cost_df)
    cost_df["Total to Pay"] = cost_df["FTDs"] * cost_df["CPA to Pay"]

    income_df["Leads"] = [50] * len(income_df)
    income_df["FTDs"] = [5] * len(income_df)
    income_df["Total to Collect"] = income_df["FTDs"] * income_df["CPA to Collect"]

    # Merge Money Out
    merged_out = pd.merge(cost_df, money_out, how="left", left_on="Affiliate", right_on="Affiliate")
    merged_out["How Much We Paid"] = merged_out["How Much We Paid"].fillna(0)
    merged_out["Updated Balance"] = merged_out["Total to Pay"] - merged_out["How Much We Paid"]

    # Merge Money In
    merged_in = pd.merge(income_df, money_in, how="left", left_on="Brand", right_on="Brand")
    merged_in["Payment Received"] = merged_in["Payment Received"].fillna(0)
    merged_in["Updated Balance"] = merged_in["Payment Received"] - merged_in["Total to Collect"]

    # P&L summary
    pl = pd.DataFrame({
        "Entity": list(cost_df["Affiliate"]) + list(income_df["Brand"]),
        "Type": ["Affiliate"] * len(cost_df) + ["Brand"] * len(income_df),
        "Total Income": [0] * len(cost_df) + list(income_df["Total to Collect"]),
        "Total Cost": list(cost_df["Total to Pay"]) + [0] * len(income_df)
    })
    pl["Profit/Loss"] = pl["Total Income"] - pl["Total Cost"]

    # Output file
    output_path = os.path.join("C:\\Users\\meyta\\OneDrive\\Desktop\\Lead calc", "Lead_System_Full_Output.xlsx")
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        cost_df.to_excel(writer, sheet_name="COST", index=False)
        income_df.to_excel(writer, sheet_name="INCOME", index=False)
        merged_in.to_excel(writer, sheet_name="MONEY IN", index=False)
        merged_out.to_excel(writer, sheet_name="MONEY OUT", index=False)
        pl.to_excel(writer, sheet_name="PROFIT & LOSS", index=False)

    st.success("📁 קובץ הפלט נשמר בהצלחה עם כל הגיליונות.")
    st.markdown(f"`{output_path}`")
