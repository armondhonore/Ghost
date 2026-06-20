# Nexlayer — Ghost

<!-- nexlayer:meta version=1 analyzed=2026-06-20T17:17:42Z repo=https://github.com/armondhonore/Ghost branch=nexlayer -->

> **For AI agents (Claude Code, Cursor, Gemini CLI, Copilot):**
> This file is the **project context** for this Nexlayer deployment — tech stack, env vars, secrets, live URL.
> For full platform detail (nexlayer.yaml schema, Dockerfile rules, CI/CD, task recipes) read **`nexlayer.skills`** in this repo.
>
> **Critical rules (full detail in `nexlayer.skills`):**
> - Inter-pod refs: `${podName:port}` only — never `localhost` or bare hostnames
> - Docker Hub images: prefix with `mirror.gcr.io/library/` — bare tags fail on the cluster
> - Secrets: set in the Nexlayer dashboard — never commit to `nexlayer.yaml` or Dockerfile
>
> **This file:** `agent-managed` sections update automatically. `user-editable` sections (Local Development Setup, Nexlayer Deployment Plan, Build Notes) are yours — preserved across re-analysis.

## Project Summary
<!-- nexlayer:section agent-managed=project_summary -->
Ghost is a professional open-source headless Node.js CMS and publishing platform used for creating blogs and newsletters.
<!-- nexlayer:end -->

## Technology Stack
<!-- nexlayer:section agent-managed=tech_stack -->
| Name | Kind | Version | Detected From |
|------|------|---------|---------------|
| Node.js | language | 22.18.0 | .node-version, package.json |
| pnpm | tool | 11.6.0 | package.json |
| NX | build | not-specified | nx.json, package.json |
| Vite | build | not-specified | apps/activitypub/package.json |
| MySQL | database | not-specified | README.md |
<!-- nexlayer:end -->

## Repository Structure
<!-- nexlayer:section agent-managed=structure_map -->
- ghost/ — Core Ghost CMS logic and server
- apps/ — Independent frontend applications and plugins (activitypub, admin, etc.)
- e2e/ — End-to-end test suite
- docker/ — Containerization configurations
<!-- nexlayer:end -->

## External Services Required
<!-- nexlayer:section agent-managed=external_deps -->
Services that must be configured separately (not deployed by Nexlayer):

- Stripe API (STRIPE_SECRET_KEY)
- Mailgun SMTP (MAILGUN_SMTP_USER)
<!-- nexlayer:end -->

## Local Development Setup
<!-- nexlayer:section user-editable=local_setup -->
### Prerequisites

- Node.js 22.18.0
- pnpm 11.6.0

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
MAILGUN_SMTP_USER=postmaster@...
MAILGUN_SMTP_PASS=...
```

### Steps

1. `pnpm install` — Install monorepo dependencies
2. `pnpm run build` — Build all packages and apps using NX
3. `pnpm run dev` — Start development environment via docker-compose

<!-- nexlayer:end -->

## Nexlayer Setup
<!-- nexlayer:section agent-managed=nexlayer_setup -->
### Pod Environment Variables

| Pod | Variable | Value | Kind |
|-----|----------|-------|------|
| `app` | `url` | `"<% URL %>"` | plain |
| `app` | `database__client` | `"mysql"` | plain |
| `app` | `database__connection__host` | `"mysql.pod"` | plain |
| `app` | `database__connection__user` | `"ghost"` | plain |
| `app` | `database__connection__password` | _(set via Nexlayer dashboard)_ | secret |
| `app` | `database__connection__database` | `"ghost"` | plain |
| `mysql` | `MYSQL_ROOT_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |
| `mysql` | `MYSQL_DATABASE` | `"ghost"` | plain |
| `mysql` | `MYSQL_USER` | `"ghost"` | plain |
| `mysql` | `MYSQL_PASSWORD` | _(set via Nexlayer dashboard)_ | secret |
| `mysql-data` | `size` | `10Gi` | plain |
| `mysql-data` | `mountPath` | `/var/lib/mysql` | plain |

### Secrets Required

Set these in the Nexlayer dashboard before deploying:

- `database__connection__password` (`app` pod)
- `MYSQL_ROOT_PASSWORD` (`mysql` pod)
- `MYSQL_PASSWORD` (`mysql` pod)

### nexlayer.yaml

```yaml
application:
  name: ghost-cms
  pods:
    - name: app
      image: "registry.nexlayer.io/user_01kece1xyh817dwff7wnarhkxd/ghost:19ee6094388"
      path: /
      servicePorts:
        - 2368
      vars:
        url: "<% URL %>"
        database__client: "mysql"
        database__connection__host: "mysql.pod"
        database__connection__user: "ghost"
        database__connection__password: "ghostpassword"
        database__connection__database: "ghost"
    - name: mysql
      image: mirror.gcr.io/library/mysql:8
      servicePorts:
        - 3306
      vars:
        MYSQL_ROOT_PASSWORD: "rootpassword"
        MYSQL_DATABASE: "ghost"
        MYSQL_USER: "ghost"
        MYSQL_PASSWORD: "ghostpassword"
      volumes:
        - name: mysql-data
          size: 10Gi
          mountPath: /var/lib/mysql
```

<!-- nexlayer:end -->

## Nexlayer Deployment Plan
<!-- nexlayer:section user-editable=deployment_plan -->
### Pod Topology

| Pod | Image | Port | Role |
|-----|-------|------|------|
| ghost-core | mirror.gcr.io/library/node:22-alpine | 2368 | web |
| mysql | mirror.gcr.io/library/mysql:8.0 | 3306 | database |

### Deployment notes

- Ghost core connects to the database using mysql.pod:3306
- The monorepo structure requires an NX build phase before runtime containerization
- For production, a reverse proxy (e.g. Nginx) is typically placed in front of the ghost-core pod

<!-- nexlayer:end -->

## Build Notes
<!-- nexlayer:section user-editable=build_notes -->
<!-- Add notes for future builds here — preserved across re-analysis -->
<!-- nexlayer:end -->

## Nexlayer Configuration
<!-- nexlayer:section agent-managed=nexlayer_config -->
**Last deployed:** 2026-06-20T17:19:51Z  
**Live URL:** https://relaxed-weasel-ghost-cms.cloud.nexlayer.ai  
**Runtime:**  · **Port:** auto-detected  
**Deploy branch:** nexlayer  

```yaml
application:
  name: ghost-cms
  pods:
    - name: app
      image: "registry.nexlayer.io/user_01kece1xyh817dwff7wnarhkxd/ghost:19ee6094388"
      path: /
      servicePorts:
        - 2368
      vars:
        url: "<% URL %>"
        database__client: "mysql"
        database__connection__host: "mysql.pod"
        database__connection__user: "ghost"
        database__connection__password: "ghostpassword"
        database__connection__database: "ghost"
    - name: mysql
      image: mirror.gcr.io/library/mysql:8
      servicePorts:
        - 3306
      vars:
        MYSQL_ROOT_PASSWORD: "rootpassword"
        MYSQL_DATABASE: "ghost"
        MYSQL_USER: "ghost"
        MYSQL_PASSWORD: "ghostpassword"
      volumes:
        - name: mysql-data
          size: 10Gi
          mountPath: /var/lib/mysql
```
<!-- nexlayer:end -->

## Build History
<!-- nexlayer:section agent-managed=build_history -->
| Date | Status | Notes |
|------|--------|-------|
| 2026-06-20T17:17:42Z | analyzed | initial repo analysis |
| 2026-06-20T17:19:51Z | success | deployed https://relaxed-weasel-ghost-cms.cloud.nexlayer.ai |
<!-- nexlayer:end -->
