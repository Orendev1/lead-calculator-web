
import streamlit as st
import pandas as pd
import os

# הגדרת תיקיית שמירה
output_dir = r"C:\Users\meyta\OneDrive\Desktop\Lead calc"
os.makedirs(output_dir, exist_ok=True)

st.title("🧮 Lead & FTD Summary Generator")

uploaded_file = st.file_uploader("📤 העלה קובץ נתונים גולמי (CSV או Excel)", type=["csv", "xlsx"])

if uploaded_file:
    file_ext = uploaded_file.name.split(".")[-1].lower()
    if file_ext == "csv":
        df = pd.read_csv(uploaded_file)
    else:
        df = pd.read_excel(uploaded_file)

    st.success("✅ קובץ הועלה בהצלחה!")

    # ניקוי שורות עם המילה 'test' (ללא תלות באותיות)
    original_count = len(df)
    df = df[~df.apply(lambda row: row.astype(str).str.contains("test", case=False, na=False).any(), axis=1)]
    removed_count = original_count - len(df)

    st.info("🧹 הוסרו " + str(removed_count) + " שורות שהכילו את המילה 'test'")

    # הוספת עמודות עזר
    df["Lead_Count"] = df["Type"].isin(["LEAD", "DEPOSITOR"]).astype(int)
    df["FTD_Count"] = (df["Type"] == "DEPOSITOR").astype(int)

    # טבלת סיכום לפי קמפיין + ברנד + מדינה
    brand_summary = (
        df.groupby(["Campaign", "Brand", "Country"])
        .agg({"Lead_Count": "sum", "FTD_Count": "sum"})
        .rename(columns={"Lead_Count": "Total leads", "FTD_Count": "Total FTD's"})
        .reset_index()
    )
    brand_summary["CR (%)"] = (brand_summary["Total FTD's"] / brand_summary["Total leads"] * 100).round(2)

    # טבלת סיכום לפי אפיליאט + מדינה
    aff_summary = (
        df.groupby(["Affiliate", "Country"])
        .agg({"Lead_Count": "sum", "FTD_Count": "sum"})
        .rename(columns={"Lead_Count": "Total leads", "FTD_Count": "Total FTD's"})
        .reset_index()
    )
    aff_summary["CR (%)"] = (aff_summary["Total FTD's"] / aff_summary["Total leads"] * 100).round(2)

    # טבלת סיכום שלישית לפי Campaign + Box + Brand + Country + Affiliate
    cr_summary = (
        df.groupby(["Campaign", "Box", "Brand", "Country", "Affiliate"])
        .agg({"Lead_Count": "sum", "FTD_Count": "sum"})
        .rename(columns={"Lead_Count": "Total leads", "FTD_Count": "Total FTD's"})
        .reset_index()
    )
    cr_summary["CR (%)"] = (cr_summary["Total FTD's"] / cr_summary["Total leads"] * 100).round(2)

    # שמירת הקבצים
    brand_file_path = os.path.join(output_dir, "brand_summary.xlsx")
    aff_file_path = os.path.join(output_dir, "affiliate_summary.xlsx")
    cr_file_path = os.path.join(output_dir, "cr_summary.xlsx")

    brand_summary.to_excel(brand_file_path, index=False)
    aff_summary.to_excel(aff_file_path, index=False)
    cr_summary.to_excel(cr_file_path, index=False)

    st.success("📁 הקבצים נשמרו בהצלחה ב:\n" + output_dir)
    st.markdown("✅ **Brand Summary**: `" + brand_file_path + "`")
    st.markdown("✅ **Affiliate Summary**: `" + aff_file_path + "`")
    st.markdown("✅ **CR Summary**: `" + cr_file_path + "`")
