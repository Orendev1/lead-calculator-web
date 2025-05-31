
@echo off
echo מריץ את מערכת הדוחות המאוחדת...
cd /d %~dp0
streamlit run scripts\generate_full_report_app.py
pause
