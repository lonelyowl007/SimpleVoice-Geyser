package io.github.theodoremeyer.simplevoicegeyser.core.update;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ContributorsCacheTest {

    @Test
    void allowsNormalHumanContributors() {
        assertTrue(ContributorsCache.isAllowedHuman("TheodoreMeyer", "User"));
        assertTrue(ContributorsCache.isAllowedHuman("lonelyowl007", "User"));
    }

    @Test
    void blocksBotsAndAiAccounts() {
        assertFalse(ContributorsCache.isAllowedHuman("dependabot[bot]", "Bot"));
        assertFalse(ContributorsCache.isAllowedHuman("github-actions[bot]", "Bot"));
        assertFalse(ContributorsCache.isAllowedHuman("cursor", "User"));
        assertFalse(ContributorsCache.isAllowedHuman("Cursor-AI", "User"));
        assertFalse(ContributorsCache.isAllowedHuman("copilot-swe-agent[bot]", "Bot"));
        assertFalse(ContributorsCache.isAllowedHuman("chatgpt-bot", "User"));
        assertFalse(ContributorsCache.isAllowedHuman("SomeOrg", "Bot"));
    }
}
