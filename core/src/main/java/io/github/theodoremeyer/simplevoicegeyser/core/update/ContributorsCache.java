package io.github.theodoremeyer.simplevoicegeyser.core.update;

import io.github.theodoremeyer.simplevoicegeyser.core.SvgCore;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

/**
 * Fetches GitHub contributors for the public join-page showcase.
 * <p>
 * Results are cached on disk for {@link #CACHE_TTL_MS} so servers only hit GitHub
 * about once per day. Bots and known AI agent accounts are filtered out.
 */
public final class ContributorsCache {

    public static final String DEFAULT_REPO = "TheodoreMeyer/SimpleVoice-Geyser";
    private static final long CACHE_TTL_MS = 24L * 60L * 60L * 1000L;
    private static final Pattern BOT_SUFFIX = Pattern.compile(".*\\[bot]$", Pattern.CASE_INSENSITIVE);

    /** Logins / substrings that should never appear in the public credit reel. */
    private static final Set<String> BLOCKED_LOGINS = Set.of(
            "dependabot",
            "dependabot[bot]",
            "github-actions",
            "github-actions[bot]",
            "renovate",
            "renovate[bot]",
            "imgbot",
            "imgbot[bot]",
            "cursor",
            "cursor-ai",
            "cursor[bot]",
            "cursoragent",
            "copilot",
            "copilot-swe-agent",
            "copilot-swe-agent[bot]",
            "chatgpt",
            "openai",
            "claude",
            "anthropic",
            "gemini",
            "devin-ai",
            "devon",
            "aider",
            "swe-agent",
            "openhands"
    );

    private static final AtomicReference<JSONObject> SNAPSHOT = new AtomicReference<>();
    private static volatile boolean refreshInFlight;

    private ContributorsCache() {}

    /**
     * Kick off a background refresh if the feature is enabled and the cache is stale.
     */
    public static void warmAsync() {
        if (!Boolean.TRUE.equals(SvgCore.getConfig().WEB_SHOW_CONTRIBUTORS.get())) {
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                getPayload(false);
            } catch (Exception e) {
                SvgCore.getLogger().debug("Contributors warm-up failed", e);
            }
        });
    }

    /**
     * @param forceRefresh ignore TTL and re-fetch from GitHub
     * @return JSON payload for {@code /svg-contributors.json}
     */
    public static JSONObject getPayload(boolean forceRefresh) {
        JSONObject cached = SNAPSHOT.get();
        if (!forceRefresh && cached != null && !isStale(cached)) {
            return cached;
        }

        Path disk = cacheFile();
        if (!forceRefresh && disk != null && Files.isRegularFile(disk)) {
            try {
                JSONObject fromDisk = new JSONObject(Files.readString(disk, StandardCharsets.UTF_8));
                SNAPSHOT.set(fromDisk);
                if (!isStale(fromDisk)) {
                    return fromDisk;
                }
            } catch (Exception e) {
                SvgCore.getLogger().debug("Could not read contributors cache file", e);
            }
        }

        JSONObject fetched = fetchFromGitHub();
        if (fetched != null) {
            SNAPSHOT.set(fetched);
            saveDisk(fetched);
            return fetched;
        }

        if (cached != null) {
            return cached;
        }
        if (disk != null && Files.isRegularFile(disk)) {
            try {
                JSONObject fromDisk = new JSONObject(Files.readString(disk, StandardCharsets.UTF_8));
                SNAPSHOT.set(fromDisk);
                return fromDisk;
            } catch (Exception ignored) {
                // fall through to seed
            }
        }
        JSONObject seed = loadSeed();
        SNAPSHOT.set(seed);
        return seed;
    }

    private static boolean isStale(JSONObject payload) {
        long fetchedAt = payload.optLong("fetchedAt", 0L);
        return fetchedAt <= 0L || (System.currentTimeMillis() - fetchedAt) > CACHE_TTL_MS;
    }

    private static JSONObject fetchFromGitHub() {
        if (refreshInFlight) {
            return null;
        }
        refreshInFlight = true;
        try {
            String repo = normalizeRepo(SvgCore.getConfig().WEB_CONTRIBUTORS_REPO.get());
            String url = "https://api.github.com/repos/" + repo + "/contributors?per_page=100&anon=false";

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();

            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(12))
                    .header("Accept", "application/vnd.github+json")
                    .header("User-Agent", "SimpleVoice-Geyser/" + SvgCore.VERSION)
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                SvgCore.getLogger().debug(
                        "GitHub contributors HTTP " + response.statusCode() + " for " + repo
                );
                return null;
            }

            JSONArray raw = new JSONArray(response.body());
            JSONArray people = new JSONArray();
            for (int i = 0; i < raw.length(); i++) {
                JSONObject row = raw.optJSONObject(i);
                if (row == null) {
                    continue;
                }
                String login = row.optString("login", "").trim();
                String type = row.optString("type", "");
                int contributions = row.optInt("contributions", 0);
                if (!isAllowedHuman(login, type) || contributions <= 0) {
                    continue;
                }
                JSONObject person = new JSONObject();
                person.put("login", login);
                person.put("avatarUrl", row.optString("avatar_url", ""));
                person.put("profileUrl", row.optString("html_url", "https://github.com/" + login));
                person.put("commits", contributions);
                people.put(person);
            }

            JSONObject payload = new JSONObject();
            payload.put("repo", repo);
            payload.put("fetchedAt", System.currentTimeMillis());
            payload.put("source", "github");
            payload.put("contributors", people);
            SvgCore.getLogger().info(
                    "Loaded " + people.length() + " GitHub contributor(s) for web credits (" + repo + ")."
            );
            return payload;
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            SvgCore.getLogger().debug("GitHub contributors fetch failed", e);
            return null;
        } finally {
            refreshInFlight = false;
        }
    }

    static boolean isAllowedHuman(String login, String type) {
        if (login == null || login.isBlank()) {
            return false;
        }
        if (type != null && !type.isBlank() && !"User".equalsIgnoreCase(type)) {
            return false;
        }
        String lower = login.toLowerCase(Locale.ROOT);
        if (BOT_SUFFIX.matcher(lower).matches() || lower.endsWith("-bot")) {
            return false;
        }
        if (BLOCKED_LOGINS.contains(lower)) {
            return false;
        }
        for (String blocked : BLOCKED_LOGINS) {
            if (lower.contains(blocked) && (blocked.contains("bot") || blocked.contains("ai")
                    || blocked.contains("cursor") || blocked.contains("copilot")
                    || blocked.contains("chatgpt") || blocked.contains("openai")
                    || blocked.contains("claude") || blocked.contains("anthropic"))) {
                return false;
            }
        }
        // Extra guard: anything that literally says "cursor" + "ai"
        return !(lower.contains("cursor") && lower.contains("ai"));
    }

    private static String normalizeRepo(String raw) {
        if (raw == null || raw.isBlank()) {
            return DEFAULT_REPO;
        }
        String repo = raw.trim();
        if (repo.startsWith("https://github.com/")) {
            repo = repo.substring("https://github.com/".length());
        }
        if (repo.endsWith(".git")) {
            repo = repo.substring(0, repo.length() - 4);
        }
        while (repo.endsWith("/")) {
            repo = repo.substring(0, repo.length() - 1);
        }
        if (!repo.contains("/") || repo.split("/").length != 2) {
            return DEFAULT_REPO;
        }
        return repo;
    }

    private static Path cacheFile() {
        try {
            Path parent = SvgCore.getConfig().getFile().getFile().toPath().getParent();
            if (parent == null) {
                return null;
            }
            Path dir = parent.resolve("cache");
            Files.createDirectories(dir);
            return dir.resolve("contributors.json");
        } catch (Exception e) {
            return null;
        }
    }

    private static void saveDisk(JSONObject payload) {
        Path disk = cacheFile();
        if (disk == null) {
            return;
        }
        try {
            Files.writeString(disk, payload.toString(2), StandardCharsets.UTF_8);
        } catch (Exception e) {
            SvgCore.getLogger().debug("Could not write contributors cache", e);
        }
    }

    private static JSONObject loadSeed() {
        try (InputStream in = ContributorsCache.class.getResourceAsStream("/web/contributors.seed.json")) {
            if (in != null) {
                String text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
                JSONObject seed = new JSONObject(text);
                if (!seed.has("fetchedAt")) {
                    seed.put("fetchedAt", 0L);
                }
                if (!seed.has("source")) {
                    seed.put("source", "seed");
                }
                return seed;
            }
        } catch (Exception e) {
            SvgCore.getLogger().debug("Could not load contributors seed", e);
        }
        JSONObject empty = new JSONObject();
        empty.put("repo", DEFAULT_REPO);
        empty.put("fetchedAt", 0L);
        empty.put("source", "empty");
        empty.put("contributors", new JSONArray());
        return empty;
    }
}
