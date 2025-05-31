
import streamlit as st
import pandas as pd
import os

st.title("💰 Money In / Out Summary with Balance Calculation")

cost_file = st.file_uploader("📤 העלה קובץ raw_data_calc_all_weeks_Cost", type=["xlsx"], key="cost")
income_file = st.file_uploader("📤 העלה קובץ raw_data_calc_all_weeks_Income", type=["xlsx"], key="income")
manual_payments_file = st.file_uploader("📤 העלה קובץ Manual_Payments_Template", type=["xlsx"], key="manual")

if cost_file and income_file and manual_payments_file:
    cost_df = pd.read_excel(cost_file)
    income_df = pd.read_excel(income_file)
    manual_out = pd.read_excel(manual_payments_file, sheet_name="Money Out")
    manual_in = pd.read_excel(manual_payments_file, sheet_name="Money In")

    st.success("✅ כל הקבצים נטענו בהצלחה")

    # Money Out
    money_out = pd.merge(cost_df, manual_out, how="left",
                         left_on=["Week num", "Affiliate", "Box ID", "Country"],
                         right_on=["Week Number", "Affiliate", "Box ID", "Country"])
    money_out["How Much We Paid"] = money_out["How Much We Paid"].fillna(0)
    money_out["Balance"] = money_out["Total to Pay"] - money_out["How Much We Paid"]

    # Money In
    money_in = pd.merge(income_df, manual_in, how="left",
                        left_on=["Week num", "Brand", "Campaign", "Country"],
                        right_on=["Week Number", "Brand", "Campaign", "Country"])
    money_in["Payment Received"] = money_in["Payment Received"].fillna(0)
    money_in["Balance"] = money_in["Payment Received"] - money_in["Total to Collect"]

    # Save
    output_dir = r"C:\Users\meyta\OneDrive\Desktop\Lead calc"
    out_path = os.path.join(output_dir, "Money_Out_Calculated.xlsx")
    in_path = os.path.join(output_dir, "Money_In_Calculated.xlsx")
    money_out.to_excel(out_path, index=False)
    money_in.to_excel(in_path, index=False)

    st.success("📁 קבצי Money In ו-Money Out נשמרו בהצלחה בתיקייה")
    st.markdown(f"🟦 **Money Out**: `{out_path}`")
    st.markdown(f"🟨 **Money In**: `{in_path}`")
