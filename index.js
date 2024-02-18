const core = require("@actions/core");
const github = require("@actions/github");
const cc = require("@conventional-commits/parser");

const types = {
    build: {icon: ":package:", title: "Builds"},
    chore: {icon: ":recycle:", title: "Chores"},
    ci: {icon: ":construction_worker:", title: "Continuous Integrations"},
    docs: {icon: ":memo:", title: "Documentation"},
    feat: {icon: ":sparkles:", title: "New Features"},
    fix: {icon: ":bug:", title: "Bug Fixes"},
    perf: {icon: ":zap:", title: "Performance Improvements"},
    refactor: {icon: ":hammer:", title: "Refactors"},
    revert: {icon: ":wastebasket:", title: "Reverts"},
    style: {icon: ":lipstick:", title: "Styles"},
    test: {icon: ":test_tube:", title: "Tests"}
};
const typeOrder = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];

async function main() {
    const token = core.getInput("token");
    let baseRef = core.getInput("base-ref");
    let headRef = core.getInput("head-ref");
    const excludeTypes = new Set(core.getInput("exclude-types").split(",").filter((type) => type !== ""));
    const onlyTypes = new Set(core.getInput("only-types").split(",").filter((type) => type !== ""));
    const excludeScopes = new Set(core.getInput("exclude-scopes").split("\n").filter((scope) => scope !== ""));
    const showIcons = core.getBooleanInput("show-icons");
    const mentionAuthors = core.getBooleanInput("mention-authors");
    const octokit = github.getOctokit(token);

    if (!baseRef) {
        const latestReleaseData = await octokit.rest.repos.getLatestRelease(github.context.repo);
        if (latestReleaseData.status !== 200) {
            core.setFailed(`Couldn't get latest release (status ${latestReleaseData.status}).`);
        }

        core.startGroup("Latest release data");
        core.info(JSON.stringify(latestReleaseData, null, 2));
        core.endGroup();

        baseRef = latestReleaseData.data.tag_name;
    }

    if (!headRef) {
        headRef = github.context.sha;
    }

    core.info(`Base ref: ${baseRef}`);
    core.info(`Head ref: ${headRef}`);

    const compareData = await octokit.rest.repos.compareCommitsWithBasehead({
        ...github.context.repo,
        basehead: `${baseRef}...${headRef}`
    });
    if (compareData.status !== 200) {
        core.setFailed(`Couldn't compare commits (status ${compareData.status}).`);
    }

    core.info(`${compareData.data.total_commits} commits found.`)
    core.startGroup("Compare data");
    core.info(JSON.stringify(compareData, null, 2));
    core.endGroup();

    core.setOutput("compare-url", compareData.data.html_url);
    core.info(`Compare URL: ${compareData.data.html_url}`);

    let commitsByType = {};
    for (const type of Object.keys(types)) {
        if (!excludeTypes.has(type) && (onlyTypes.size === 0 || onlyTypes.has(type))) {
            commitsByType[type] = [];
        }
    }

    for (const commitData of compareData.data.commits) {
        core.startGroup(`Commit - ${commitData.commit.message.split("\n\n")[0]}`);
        try {
            const ast = cc.toConventionalChangelogFormat(cc.parser(commitData.commit.message));
            if (commitsByType[ast.type] === undefined) {
                throw new Error(`Invalid commit type: ${ast.type}`);
            } else if (excludeScopes.has(ast.scope)) {
                throw new Error(`Excluded commit scope: ${ast.scope}`);
            }

            const commit = {
                scope: ast.scope,
                subject: ast.subject,
                sha: commitData.sha,
                author: commitData.author.login
            };
            commitsByType[ast.type].push(commit);

            core.info(JSON.stringify(commit, null, 2));
        } catch (error) {
            core.info("[skipped]");
        } finally {
            core.endGroup();
        }
    }

    let changelog_lines = [];
    for (const type of typeOrder) {
        if (commitsByType[type] === undefined || commitsByType[type].length === 0) {
            continue;
        }

        let changelog_title_line = [];
        if (showIcons) {
            changelog_title_line.push(types[type].icon);
        }
        changelog_title_line.push(types[type].title);

        changelog_lines.push(`### ${changelog_title_line.join(" ")}`);

        for (const commit of commitsByType[type]) {
            let changelog_line = [];
            if (commit.scope !== null) {
                changelog_line.push(`**${commit.scope}**:`);
            }
            changelog_line.push(commit.subject);
            changelog_line.push(commit.sha);
            if (mentionAuthors) {
                changelog_line.push(`@${commit.author}`);
            }

            changelog_lines.push(`- ${changelog_line.join(" ")}`);
        }

        changelog_lines.push("");
    }

    const changelog = changelog_lines.join("\n");
    core.setOutput("changelog", changelog);

    core.startGroup("Changelog");
    core.info(changelog);
    core.endGroup();
}

main();
