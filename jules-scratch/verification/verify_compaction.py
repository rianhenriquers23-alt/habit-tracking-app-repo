
import asyncio
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        path = os.path.abspath("app habit tracker/index.html")
        page.goto(f"file://{path}")

        # Wait for animations and rendering
        page.wait_for_timeout(2000)

        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
