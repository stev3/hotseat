import { test, expect } from '@playwright/test';

test.describe('HotSeat App', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('should create a session and display host console', async ({ page }) => {
        // Check landing page
        await expect(page.locator('h1')).toContainText('HotSeat');

        // Create session
        const titleInput = page.locator('input[type="text"]');
        await titleInput.fill('Test Session');
        await page.click('button:has-text("Begin")');

        // Should redirect to host page
        await expect(page).toHaveURL(/\/host\/[A-Z0-9]{6}/);

        // Check host console elements
        await expect(page.locator('h1')).toContainText('Test Session');
        await expect(page.locator('text=Attendees')).toBeVisible();
        await expect(page.locator('text=Start Session')).toBeVisible();
    });

    test('should display QR code on host page', async ({ page }) => {
        await page.locator('input[type="text"]').fill('Test Session');
        await page.click('button:has-text("Begin")');

        // Wait for QR code to load
        const qrCode = page.locator('img[alt="QR Code"]');
        await expect(qrCode).toBeVisible({ timeout: 5000 });
    });

    test('should show attendee count', async ({ page }) => {
        await page.locator('input[type="text"]').fill('Test Session');
        await page.click('button:has-text("Begin")');

        await expect(page.locator('text=/0 Attendees/')).toBeVisible();
    });
});

