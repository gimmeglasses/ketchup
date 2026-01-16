import { test, expect } from "@playwright/test";
import { TopPage } from "../page/top-page";

test.describe("トップページ（ランディングページ）", () => {
  let topPage: TopPage;

  test.beforeEach(async ({ page }) => {
    topPage = new TopPage(page);
    await topPage.navigate();
  });

  test("ページが正しく読み込まれること", async () => {
    await topPage.verifyPageLoaded();
  });

  test("ページ全体のレイアウトが正しく表示されること", async () => {
    await topPage.verifyPageLayout();
  });

  test("ロゴが表示されること", async () => {
    await topPage.verifyLogoVisible();
  });

  test.describe("ヒーローセクション", () => {
    test("ヒーローセクションが正しく表示されること", async () => {
      await topPage.verifyHeroSectionVisible();
    });

    test("ヒーローの見出しテキストが正しいこと", async () => {
      await topPage.verifyHeroHeading();
    });
  });

  test.describe("CTAボタン", () => {
    test("CTAボタンが表示されること", async () => {
      await topPage.verifyCTAButtonsVisible();
    });

    test("会員登録ボタンが正しいリンク先を持つこと", async () => {
      await topPage.verifyRegisterButtonLink();
    });

    test("CTAログインボタンが正しいリンク先を持つこと", async () => {
      await topPage.verifyCTALoginButtonLink();
    });
    test("会員登録ボタンをクリックすると会員登録ページに遷移すること", async ({
      page,
    }) => {
      await topPage.navigate();
      await topPage.clickRegisterButton();
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test("CTAログインボタンをクリックするとログインページに遷移すること", async ({
      page,
    }) => {
      await topPage.waitForEnabled(topPage.getCTALoginButton());
      await topPage.clickCTALoginButton();
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("ヘッダー", () => {
    test("ヘッダーが表示されること", async () => {
      await topPage.verifyHeaderVisible();
    });

    test("ヘッダーのログインボタンが表示されること", async () => {
      await topPage.verifyHeaderLoginButtonVisible();
    });

    test("ヘッダーのログインボタンが正しいリンク先を持つこと", async () => {
      await topPage.verifyHeaderLoginButtonLink();
    });

    test("ヘッダーのログインボタンをクリックするとログインページに遷移すること", async ({
      page,
    }) => {
      await topPage.clickHeaderLoginButton();
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("機能紹介カード", () => {
    test("機能紹介カードが表示されること", async () => {
      await topPage.verifyFeatureCardsVisible();
    });

    test("ポモドーロ機能カードの内容が正しいこと", async () => {
      await topPage.verifyPomodoroFeatureCard();
    });

    test("Todoリスト機能カードの内容が正しいこと", async () => {
      await topPage.verifyTodoFeatureCard();
    });
  });

  test.describe("フッター", () => {
    test("フッターが表示されること", async () => {
      await topPage.verifyFooterVisible();
    });
  });
});
