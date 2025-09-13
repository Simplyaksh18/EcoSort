import pandas as pd
import random
from datetime import datetime, timedelta

# Generate only September 2025 data (September 1-12, 2025)
# September 13th will be generated dynamically by the backend

start_date = datetime(2025, 9, 1)
end_date = datetime(2025, 9, 12)  # Up to Sept 12, Sept 13 will be dynamic

# Generate realistic waste data for Bhubaneswar city (September only)
dates = []
organic_data = []
recyclable_data = []
hazardous_data = []

# Base amounts for a city like Bhubaneswar (in kg)
base_organic = 120
base_recyclable = 80
base_hazardous = 25

# Collection days (random days when waste amounts drop significantly) - 3 collection days in 12 days
collection_days = random.sample(range(12), 3)  # 3 collection days in 12 days

for i in range(12):  # Only 12 days (Sept 1-12)
    date = start_date + timedelta(days=i)
    dates.append(date.strftime('%Y-%m-%d'))
    
    if i in collection_days:
        # Collection day - amounts drop significantly (20-40% of normal)
        organic = round(random.uniform(base_organic * 0.2, base_organic * 0.4), 1)
        recyclable = round(random.uniform(base_recyclable * 0.2, base_recyclable * 0.4), 1)
        hazardous = round(random.uniform(base_hazardous * 0.2, base_hazardous * 0.4), 1)
    else:
        # Normal accumulation day with some variation
        organic = round(random.uniform(base_organic * 0.7, base_organic * 1.3), 1)
        recyclable = round(random.uniform(base_recyclable * 0.7, base_recyclable * 1.3), 1)
        hazardous = round(random.uniform(base_hazardous * 0.7, base_hazardous * 1.3), 1)
    
    organic_data.append(organic)
    recyclable_data.append(recyclable)
    hazardous_data.append(hazardous)

# Create DataFrame
df = pd.DataFrame({
    'date': dates,
    'total_organic_kg': organic_data,
    'total_recyclable_kg': recyclable_data,
    'total_hazardous_kg': hazardous_data
})

# Save to CSV
df.to_csv('daily_waste_data.csv', index=False)

print("Generated daily_waste_data.csv with September 2025 data only:")
print(f"Data range: September 1-12, 2025 ({len(dates)} days)")
print("September 13th will be generated dynamically by the backend")
print("\nGenerated data:")
print(df)
print(f"\nCollection days (lower amounts): {[dates[i] for i in collection_days]}")