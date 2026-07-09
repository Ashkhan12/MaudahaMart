with open('src/components/CustomerPortal.tsx', 'r') as f:
    lines = f.readlines()

# Let's find the exact indices
search_panel_idx = -1
delivery_zone_idx = -1
ai_smart_picks_idx = -1

for i, line in enumerate(lines):
    if "{/* Real-time Search Panel */}" in line:
        search_panel_idx = i
    if "{/* Delivery Zone Map Section */}" in line:
        delivery_zone_idx = i
    if "{/* --- AI SMART PICKS & MAUDAHA TRENDS PANEL --- */}" in line:
        ai_smart_picks_idx = i

print(f"search_panel_idx: {search_panel_idx}")
print(f"delivery_zone_idx: {delivery_zone_idx}")
print(f"ai_smart_picks_idx: {ai_smart_picks_idx}")

if search_panel_idx != -1 and delivery_zone_idx != -1 and ai_smart_picks_idx != -1:
    search_block = lines[search_panel_idx:delivery_zone_idx]
    # Remove search block from its original position
    del lines[search_panel_idx:delivery_zone_idx]
    
    # Recalculate ai_smart_picks_idx since we deleted lines before or after it
    # Actually, since search_panel_idx (848) is after ai_smart_picks_idx (540),
    # deleting the search block doesn't affect the index of ai_smart_picks_idx!
    # Let's double check. Yes, 540 < 848.
    
    # Now insert the search block right before the AI Smart Picks panel
    lines[ai_smart_picks_idx:ai_smart_picks_idx] = search_block
    
    with open('src/components/CustomerPortal.tsx', 'w') as f:
        f.writelines(lines)
    print("SUCCESS")
else:
    print("FAILED")
