const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3100';

test.describe('Hanzo Identity dApp - Comprehensive E2E Tests', () => {
    test.describe('Navigation and Routing', () => {
        test('should load home page by default', async ({ page }) => {
            await page.goto(BASE_URL);
            await expect(page).toHaveTitle('Hanzo Identity dApp');

            // Check home page is active
            const homeHeading = page.locator('h1').first();
            await expect(homeHeading).toContainText('Hanzo Identity');

            // Check navigation brand
            const navBrand = page.getByTestId('nav-brand');
            await expect(navBrand).toBeVisible();
        });

        test('should navigate to Protocol Identities page', async ({ page }) => {
            await page.goto(BASE_URL);

            // Click Protocol Identities nav link
            await page.getByTestId('nav-identities').click();

            // Check URL changed
            await expect(page).toHaveURL(`${BASE_URL}/#/identities`);

            // Check page title
            const heading = page.locator('h1').first();
            await expect(heading).toContainText('Protocol Identities');

            // Check search box is visible
            const searchInput = page.getByTestId('search-input');
            await expect(searchInput).toBeVisible();
        });

        test('should navigate to Register page', async ({ page }) => {
            await page.goto(BASE_URL);

            // Click Register nav link
            await page.getByTestId('nav-register').click();

            // Check URL changed
            await expect(page).toHaveURL(`${BASE_URL}/#/register`);

            // Check page heading
            const heading = page.locator('h1').first();
            await expect(heading).toContainText('Register Identity');
        });

        test('should navigate back to home from nav brand', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identities`);

            // Click brand to go home
            await page.getByTestId('nav-brand').click();

            // Check URL changed back to home
            await expect(page).toHaveURL(`${BASE_URL}/#/`);
        });

        test('should highlight active navigation link', async ({ page }) => {
            await page.goto(BASE_URL);

            // Navigate to identities
            await page.getByTestId('nav-identities').click();

            // Check identities link has active class
            const identitiesLink = page.getByTestId('nav-identities');
            await expect(identitiesLink).toHaveClass(/active/);
        });
    });

    test.describe('Home Page', () => {
        test('should display hero section with connect button', async ({ page }) => {
            await page.goto(BASE_URL);

            // Check hero text
            const hero = page.locator('.home-hero');
            await expect(hero).toBeVisible();
            await expect(hero.locator('h1')).toContainText('Hanzo Identity');
            await expect(hero.locator('p')).toContainText('Connect your wallet');

            // Check connect button
            const connectBtn = page.getByTestId('home-connect-button');
            await expect(connectBtn).toBeVisible();
            await expect(connectBtn).toContainText('Connect Wallet');
        });

        test('should have correct styling and layout', async ({ page }) => {
            await page.goto(BASE_URL);

            // Check background color (dark theme)
            const body = page.locator('body');
            const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
            expect(bgColor).toMatch(/rgb\(10,\s*10,\s*10\)/); // #0a0a0a
        });
    });

    test.describe('Protocol Identities Page', () => {
        test('should display leaderboard structure', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identities`);

            // Check page heading
            const heading = page.locator('h1').first();
            await expect(heading).toContainText('Protocol Identities');

            // Check search input
            const searchInput = page.getByTestId('search-input');
            await expect(searchInput).toBeVisible();
            await expect(searchInput).toHaveAttribute('placeholder', 'Search identity name...');

            // Check table headers
            const table = page.locator('.identities-table');
            await expect(table).toBeVisible();
            await expect(table.locator('.table-header')).toContainText('Identity');
            await expect(table.locator('.table-header')).toContainText('Staked AI');

            // Check load more button
            const loadMoreBtn = page.getByTestId('load-more-button');
            await expect(loadMoreBtn).toBeVisible();
        });

        test('should have functioning search input', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identities`);

            const searchInput = page.getByTestId('search-input');

            // Type in search
            await searchInput.fill('test');

            // Verify input value
            await expect(searchInput).toHaveValue('test');

            // Clear search
            await searchInput.clear();
            await expect(searchInput).toHaveValue('');
        });

        test('should display identities or empty state', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identities`);

            const identitiesList = page.getByTestId('identities-list');
            await expect(identitiesList).toBeVisible();

            // Should either have identity rows or empty state
            const identityRows = await page.getByTestId('identity-row').count();
            const emptyState = await identitiesList.locator('.empty-state').count();

            expect(identityRows > 0 || emptyState > 0).toBe(true);
        });
    });

    test.describe('Profile Page', () => {
        test('should have tabs for Info, Rewards, and Delegations', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            // Check all tabs are visible
            const infoTab = page.getByTestId('tab-info');
            const rewardsTab = page.getByTestId('tab-rewards');
            const delegationsTab = page.getByTestId('tab-delegations');

            await expect(infoTab).toBeVisible();
            await expect(rewardsTab).toBeVisible();
            await expect(delegationsTab).toBeVisible();

            // Check Info tab is active by default
            await expect(infoTab).toHaveClass(/active/);
        });

        test('should display profile name', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            const profileName = page.locator('.profile-header');
            await expect(profileName).toBeVisible();
            await expect(profileName).toContainText('@@alice');
        });

        test('should switch between tabs', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            // Click Rewards tab
            await page.getByTestId('tab-rewards').click();

            // Check Rewards tab is active
            const rewardsTab = page.getByTestId('tab-rewards');
            await expect(rewardsTab).toHaveClass(/active/);

            // Check Rewards content is visible
            const rewardsContent = page.getByTestId('rewards-tab');
            await expect(rewardsContent).toBeVisible();

            // Click Delegations tab
            await page.getByTestId('tab-delegations').click();

            // Check Delegations tab is active
            const delegationsTab = page.getByTestId('tab-delegations');
            await expect(delegationsTab).toHaveClass(/active/);

            // Check Delegations content is visible
            const delegationsContent = page.getByTestId('delegations-tab');
            await expect(delegationsContent).toBeVisible();

            // Go back to Info tab
            await page.getByTestId('tab-info').click();

            // Check Info tab is active again
            const infoTab = page.getByTestId('tab-info');
            await expect(infoTab).toHaveClass(/active/);
        });

        test('Info tab should display identity information', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            const infoTab = page.getByTestId('info-tab');
            await expect(infoTab).toBeVisible();

            // Check for info labels
            await expect(infoTab).toContainText('Owner:');
            await expect(infoTab).toContainText('NFT ID:');
            await expect(infoTab).toContainText('Namespace ID:');
            await expect(infoTab).toContainText('Staked AI:');
        });

        test('Rewards tab should display rewards information', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            // Switch to Rewards tab
            await page.getByTestId('tab-rewards').click();

            const rewardsTab = page.getByTestId('rewards-tab');
            await expect(rewardsTab).toBeVisible();

            // Check for rewards content
            await expect(rewardsTab).toContainText('Staking Rewards');
            await expect(rewardsTab).toContainText('Accrued Rewards:');
            await expect(rewardsTab).toContainText('APR:');
        });

        test('Delegations tab should display delegation information', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);

            // Switch to Delegations tab
            await page.getByTestId('tab-delegations').click();

            const delegationsTab = page.getByTestId('delegations-tab');
            await expect(delegationsTab).toBeVisible();

            // Check for delegations content
            await expect(delegationsTab).toContainText('AI delegated to this identity:');
        });
    });

    test.describe('Register Page', () => {
        test('should display registration form', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);

            // Check heading
            const heading = page.locator('h1').first();
            await expect(heading).toContainText('Register Identity');

            // Check form fields
            const nameInput = page.getByTestId('identity-name-input');
            await expect(nameInput).toBeVisible();
            await expect(nameInput).toHaveAttribute('placeholder', 'yourname');

            const namespaceSelect = page.getByTestId('namespace-select');
            await expect(namespaceSelect).toBeVisible();

            // Check connect button initially visible
            const connectBtn = page.getByTestId('register-connect-button');
            await expect(connectBtn).toBeVisible();
        });

        test('should have correct network options', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);

            const namespaceSelect = page.getByTestId('namespace-select');
            const options = await namespaceSelect.locator('option').allTextContents();

            expect(options).toContain('Localhost (Testing)');
            expect(options).toContain('Hanzo Mainnet');
            expect(options).toContain('Lux Mainnet');
            expect(options).toContain('Zoo Mainnet');
        });

        test('should show price display when name is entered', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);

            const nameInput = page.getByTestId('identity-name-input');
            const priceDisplay = page.locator('#priceDisplay');

            // Initially shows placeholder text
            await expect(priceDisplay).toContainText('Enter a name to see pricing');

            // Type a name
            await nameInput.fill('testuser');

            // Price display should be visible (may show loading or price)
            await expect(priceDisplay).toBeVisible();
        });

        test('should validate name input pattern', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);

            const nameInput = page.getByTestId('identity-name-input');

            // Check pattern attribute
            await expect(nameInput).toHaveAttribute('pattern', '[a-z0-9]+');
        });
    });

    test.describe('Visual Regression Tests', () => {
        test('homepage snapshot', async ({ page }) => {
            await page.goto(BASE_URL);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveScreenshot('homepage-new.png', {
                maxDiffPixels: 100,
            });
        });

        test('identities page snapshot', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identities`);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveScreenshot('identities-page.png', {
                maxDiffPixels: 100,
            });
        });

        test('register page snapshot', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveScreenshot('register-page.png', {
                maxDiffPixels: 100,
            });
        });

        test('profile page snapshot', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/identity/alice`);
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveScreenshot('profile-page.png', {
                maxDiffPixels: 100,
            });
        });
    });

    test.describe('Responsive Design', () => {
        test('should be responsive on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(BASE_URL);

            // Check navigation is still visible
            const nav = page.locator('nav');
            await expect(nav).toBeVisible();

            // Check content is not overflowing
            const body = page.locator('body');
            const scrollWidth = await body.evaluate(el => el.scrollWidth);
            const clientWidth = await body.evaluate(el => el.clientWidth);

            // Allow some margin for subpixel rendering
            expect(scrollWidth - clientWidth).toBeLessThanOrEqual(1);
        });

        test('should adapt table layout on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(`${BASE_URL}/#/identities`);

            const table = page.locator('.identities-table');
            await expect(table).toBeVisible();

            // Table should still be functional on mobile
            const tableWidth = await table.evaluate(el => el.offsetWidth);
            expect(tableWidth).toBeGreaterThan(0);
        });
    });

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            await page.goto(BASE_URL);

            // Check h1 exists
            const h1 = page.locator('h1');
            await expect(h1).toBeVisible();

            // Navigate to identities
            await page.goto(`${BASE_URL}/#/identities`);
            const h1Identities = page.locator('h1');
            await expect(h1Identities).toBeVisible();
        });

        test('should have accessible form labels', async ({ page }) => {
            await page.goto(`${BASE_URL}/#/register`);

            // Check label associations
            const nameLabel = page.locator('label[for="identityName"]');
            await expect(nameLabel).toBeVisible();

            const namespaceLabel = page.locator('label[for="namespace"]');
            await expect(namespaceLabel).toBeVisible();
        });

        test('buttons should have descriptive text', async ({ page }) => {
            await page.goto(BASE_URL);

            // Check connect button has text
            const connectBtn = page.getByTestId('nav-connect-button');
            const btnText = await connectBtn.textContent();
            expect(btnText?.trim().length).toBeGreaterThan(0);
        });
    });

    test.describe('Dark Theme', () => {
        test('should use dark color scheme', async ({ page }) => {
            await page.goto(BASE_URL);

            // Check body background is dark
            const body = page.locator('body');
            const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
            expect(bgColor).toMatch(/rgb\(10,\s*10,\s*10\)/);

            // Check text color is light
            const textColor = await body.evaluate(el => getComputedStyle(el).color);
            expect(textColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
        });

        test('should use accent color for interactive elements', async ({ page }) => {
            await page.goto(BASE_URL);

            const connectBtn = page.getByTestId('nav-connect-button');
            const btnBgColor = await connectBtn.evaluate(el => getComputedStyle(el).backgroundColor);

            // Should be reddish accent color
            expect(btnBgColor).toMatch(/rgb\(255,\s*107,\s*107\)/);
        });
    });
});
