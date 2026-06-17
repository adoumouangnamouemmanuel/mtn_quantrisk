import matplotlib.pyplot as plt

plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.scatter(df["Inflation_YoY_Pct"], df["EBITDA_Margin_Pct"])
plt.xlabel("Inflation YoY %")
plt.ylabel("EBITDA Margin %")
plt.title("If this is a straight line → LEAKAGE")

plt.subplot(1, 2, 2)
plt.scatter(df["Cedi_USD_Avg"], df["MoMo_Revenue"])
plt.xlabel("Cedi/USD")
plt.ylabel("MoMo Revenue")
plt.title("If this is a straight line → LEAKAGE")

plt.tight_layout()
plt.show()