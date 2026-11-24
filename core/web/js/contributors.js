/**
 * Optional animated GitHub contributors credit reel under the join screen.
 * Only shown when the server sets client.web.show-contributors: true.
 */

function formatCommits(n) {
    const count = Number(n) || 0;
    if (count <= 0) {
        return "";
    }
    return count === 1 ? "1 commit" : `${count} commits`;
}

function buildCard(person) {
    const a = document.createElement("a");
    a.className = "contributorCard";
    a.href = person.profileUrl || `https://github.com/${person.login}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = person.login;

    const img = document.createElement("img");
    img.className = "contributorAvatar";
    img.src = person.avatarUrl
        || `https://avatars.githubusercontent.com/${encodeURIComponent(person.login)}`;
    img.alt = "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.width = 40;
    img.height = 40;

    const meta = document.createElement("div");
    meta.className = "contributorMeta";

    const name = document.createElement("span");
    name.className = "contributorLogin";
    name.textContent = person.login;

    const commits = document.createElement("span");
    commits.className = "contributorCommits";
    commits.textContent = formatCommits(person.commits);

    meta.append(name, commits);
    a.append(img, meta);
    return a;
}

function fillTrack(track, people) {
    track.replaceChildren();
    if (!people.length) {
        return;
    }
    // Duplicate for a seamless marquee loop.
    const copies = people.length < 6 ? 3 : 2;
    for (let c = 0; c < copies; c++) {
        for (const person of people) {
            track.appendChild(buildCard(person));
        }
    }
    const seconds = Math.max(28, people.length * 6);
    track.style.setProperty("--contributors-duration", `${seconds}s`);
}

/**
 * @param {{ showContributors?: boolean }} branding
 */
export async function initContributorsShowcase(branding) {
    const root = document.getElementById("contributorsShowcase");
    const track = document.getElementById("contributorsTrack");
    if (!root || !track) {
        return;
    }

    if (!branding?.showContributors) {
        root.classList.add("dev-hidden");
        root.setAttribute("aria-hidden", "true");
        return;
    }

    try {
        const url = new URL("svg-contributors.json", window.location.href);
        const response = await fetch(url.href, { cache: "no-store" });
        if (!response.ok) {
            root.classList.add("dev-hidden");
            return;
        }
        const data = await response.json();
        if (!data.enabled || !Array.isArray(data.contributors) || data.contributors.length === 0) {
            root.classList.add("dev-hidden");
            return;
        }

        const people = data.contributors
            .filter((p) => p && typeof p.login === "string" && p.login.trim())
            .map((p) => ({
                login: String(p.login).trim(),
                avatarUrl: String(p.avatarUrl || ""),
                profileUrl: String(p.profileUrl || ""),
                commits: Number(p.commits) || 0
            }));

        if (!people.length) {
            root.classList.add("dev-hidden");
            return;
        }

        fillTrack(track, people);
        root.classList.remove("dev-hidden");
        root.setAttribute("aria-hidden", "false");
    } catch {
        root.classList.add("dev-hidden");
    }
}
