# Dynastic-Fedimint Integration RFC (Draft)

## 1. Family Vault Architecture

The Dynastic Family Vault leverages Fedimint to create a distributed custody solution tailored for families. The core idea is to establish a Fedimint federation where guardians are trusted family members. This approach moves beyond traditional custodial solutions and complex self-custody setups, offering a balance of security, usability, and family sovereignty.

**Key characteristics of this architecture include:**

*   **Family-Operated Federations**: Each family unit can form its own Fedimint federation. Guardians within this federation are typically parents, grandparents, or other trusted adult family members.
*   **Guardian Node Deployment**: Family members acting as guardians can run their Fedimint nodes on accessible hardware, ideally on home-based sovereign computing platforms like Start9 servers. This promotes decentralization and reduces reliance on third-party VPS providers.
*   **Shared Treasury**: The "Family Vault" itself refers to the collective funds held and managed by the family's Fedimint federation. These funds are accessible and manageable through client applications (e.g., the Dynastic mobile client) according to the rules and consensus of the family federation.
*   **User Accessibility**: While some family members (guardians) manage the infrastructure (nodes), other family members (e.g., children, non-technical adults) can interact with the family funds through user-friendly mobile clients, abstracting away the complexities of private key management and Fedimint operations.

*(Placeholder for Excalidraw diagram: `![Federation Flow](https://excalidraw.com/#json=1234abcd,Fedimint-flow)` - This diagram should illustrate the interaction between family members as guardians, client users, the Fedimint modules, and potentially home server infrastructure like Start9.)*

---
## 2. Key Components (Revised Structure - Federation-Controlled Family Treasury)

*(Self-note: Original RFC outline had 2.1 Guardian Onboarding, 2.2 Ecash Splits, 2.3 Dispute Resolution. This has been re-structured based on user feedback to focus on a Federation-Controlled Family Treasury model. We are currently detailing section 2.2 from the user's 5-day plan which is now the core of this section. Guardian Onboarding from original RFC outline (2.1) is now integrated into 2.2.1.B. Dispute Resolution (original 2.3) and Threat Model (original 3) will be drafted later.)*

### 2.2.0 Prerequisite: Private Membership Agreement (PMA)

Before any individual (guardian or member) can participate in the Federation-Controlled Family Treasury functionalities, including operations involving the Citadel Hosted LNbits instance, they must review and agree to a Private Membership Agreement (PMA).

*   **Initial Implementation**: The PMA will be Citadel Academy's standard agreement, outlining the terms of service, responsibilities, and data handling related to the use of the Dynastic platform and its integrated financial tools. Members will initially be directed to an external service like DocuSign to review and sign the PMA. The Dynastic platform may integrate with the DocuSign API to track the completion status of the PMA for each user.
*   **Future Enhancements**: The long-term vision includes transitioning to a Nostr-native solution for document signing and agreement attestations. This could involve leveraging NIPs related to signed attestations on document hashes or similar decentralized mechanisms, further aligning with the ecosystem's principles of verifiability and user control.
*   **Requirement**: Successful completion and acceptance of the PMA is a mandatory onboarding step. The Dynastic client will gate access to treasury-related features until the PMA is confirmed as signed by the user. The status of PMA acceptance will be associated with the member's Nostr identity within the Dynastic system.

### 2.2.1 Guardian-Managed Family & Member Nostr Accounts

Secure and verifiable Nostr identities are foundational to the Dynastic ecosystem and interaction with the Federation-Controlled Family Treasury. This section outlines the management of a primary Family Nostr Account and associated Member Nostr Accounts, emphasizing the role of Fedimint guardian consensus.

**A. Primary Family (Citadel Academy) Federation Nostr Account:**

A central Nostr account (e.g., `citadel_academy_fed@citadel_domain.com`) serves as the official identity of the Citadel Academy Federation (and as a model for individual Family Federations). To ensure collective control, security, and proper authorization, operations related to this account and core federation settings are managed by the Federation Guardians through Fedimint consensus (e.g., requiring a 2/3 or 3/5 signature threshold). This consensus authorizes a NIP-46 compliant signer service that executes privileged Nostr actions and configuration changes.

*   **Core Federation Governance (via Fedimint Consensus):**
    *   **Relay Management**: Defining and updating the list of primary public and private Nostr relays used by the Federation account and potentially recommended or enforced for associated member accounts. This includes selecting the private relay(s) for sensitive federation data and communications.
    *   **Whitelist Management**: Approving additions or removals of Nostr public keys (`npubs`) from critical whitelists maintained by the Federation (e.g., recognized members, authorized service users). These whitelists may be stored in the Dynastic platform's Supabase database and/or published to private relays.

*   **Publishing Permissions & Content Control (for the Primary Federation Account)**:
    *   Only authenticated and active Guardians of the Federation are permitted to initiate proposals for publishing events (e.g., notes, profile updates, announcements) through the Primary Federation Account.
    *   Actual publication of such events requires Fedimint guardian consensus to authorize the NIP-46 signer service. This applies particularly to content posted to designated private relays.

*   **Payment Authorization (Zaps & LNbits Master Wallet Control)**:
    *   **Zap Events**: Initiating outgoing zap events from the Primary Federation Account requires Fedimint guardian consensus.
    *   **LNbits Master Wallet Operations**: Specific events published by (or commands issued through) the Primary Federation Account can serve as triggers to control the Citadel Hosted LNbits master wallet (detailed in Section 2.2.2). Such trigger events/commands also require Fedimint guardian consensus.

*   **Other Sensitive Operations**: Changes to the Primary Federation Account's NIP-05 metadata or critical profile details are also subject to Fedimint guardian consensus.

**B. Member Nostr Account Management (e.g., "Child" or "Family Office Member" Accounts):**

The Dynastic platform enables the creation and management of individual Nostr accounts for family members, integrated with the Family Federation's controlled treasury.

1.  **NIP-05 Identifier Provisioning & Domain Whitelisting**:
    *   **Centralized Whitelist**: Member NIP-05 identifiers (e.g., `member_name@citadel_approved_domain.com`) MUST utilize domains that are officially whitelisted. Initially, Citadel Academy manages this primary whitelist. This list is maintained in the Dynastic platform's Supabase database and published as a queryable Nostr event (e.g., a Kind 30078 event with a specific `d` tag for "nip05_domain_whitelist") to designated Citadel Academy private relays, allowing Dynastic clients to discover approved domains.
    *   **Family Federation Domains**: As Family Federations mature, they can establish and manage their own custom NIP-05 domains (e.g., `member_name@myfamily_domain.com`). Citadel Academy will provide educational resources, including courses on forking and deploying a `satnam.pub`-like identity forge for a family's own domain. To be recognized within the broader Dynastic ecosystem (especially for interaction with the Citadel Hosted LNbits), these custom family domains MUST be submitted to and approved by the Citadel Academy Federation guardians for inclusion in the primary whitelist.
    *   **Onboarding Process**: The Dynastic client's onboarding wizard guides a guardian or member through selecting a username. If the Family Federation uses a custom, Citadel-whitelisted domain, that domain is prioritized. Otherwise, users select from other Citadel-approved domains. The client then interacts with the relevant NIP-05 provisioning service (either the Family Federation's own forked `satnam.pub` instance for their custom domain, or Citadel's default `satnam.pub` service for general approved domains) to register the NIP-05 and associate it with a Nostr public key. A corresponding Lightning Address is typically provisioned simultaneously.

2.  **Key Management Options & Account Recovery**:
    The Dynastic platform offers flexibility in how Member Account Nostr keys are managed, with the specific option being chosen by the member (or by a guardian on behalf of a member, particularly for young children) and subsequently approved by Family Federation guardian consensus. All key management options are designed to integrate with account recovery services provided by the `satnam.pub` identity forge, which will incorporate Pubky Core and `nosta.me` for robust, Nostr-based recovery mechanisms. The Dynastic client will also ensure interoperability with recognized key management tools like the `nsec.app` browser extension for users who opt for self-sovereign key handling.

    *   **Option 1: Guardian-Supervised (via NIP-46 Signer Service)**:
        *   **Key Handling**: The Nostr private key for the Member Account is generated and held within a dedicated NIP-46 compliant signer service. This signer service is under the operational control and authorization of the Family Federation's guardian consensus.
        *   **Member Interaction**: The member uses their Dynastic client, which sends NIP-46 requests to this federation-controlled signer for all Nostr actions. The member does not directly possess or interact with the `nsec`.
        *   **Suitability**: Ideal for younger children or any member for whom direct key management is deemed inappropriate or too burdensome.
        *   **Account Recovery**: If a member loses access to their Dynastic client, Family Federation guardians can, via consensus, authorize the NIP-46 signer service to permit a new client instance to connect for that member. Additionally, the `satnam.pub` integrated recovery services (Pubky Core, `nosta.me`) can be utilized, with guardian approval potentially required for supervised accounts.

    *   **Option 2: Member-Held (Self-Sovereign)**:
        *   **Key Handling**: The Nostr private key is generated and managed directly by the member on their client device using the Dynastic client, or imported from other secure key management tools like the `nsec.app` browser extension. The Dynastic client will support interaction with `nsec.app` if available, allowing users to leverage it for signing operations if they prefer. The member is solely responsible for backing up their key (e.g., via a seed phrase). Guardians do not have access to this private key.
        *   **Member Interaction**: The Dynastic client signs Nostr events locally using the member-held private key or facilitates signing via `nsec.app` if configured by the user.
        *   **Suitability**: Designed for adult family members, or any member capable and willing to take full responsibility for their key security and preferred tooling.
        *   **Account Recovery**: Members using self-sovereign keys are primarily responsible for their own backup and recovery. They will be strongly encouraged and guided by the Dynastic client to utilize the `satnam.pub` integrated recovery services (Pubky Core, `nosta.me`) and to make secure backups of their keys, potentially including exporting to `nsec.app` or other key managers.

    The choice of key management option is recorded as part of the member's profile within the Dynastic system and is subject to the overall approval by the Family Federation guardians (as per Section 2.2.1.B.3).

3.  **Federation Approval & Membership Integration**:
    *   **Prerequisite for Initiating Guardians**: The ability to initiate the formation of a new Family Federation (i.e., to become its first set of guardians) within the Citadel Academy ecosystem is contingent upon successfully completing a designated "Family Fedimint Operations" educational module and earning the corresponding prerequisite badge. This ensures a baseline understanding of Fedimint setup, operations, and security. *(Self-note: This point might be better placed in an earlier overview section on "Family Federation Lifecycle" or "Guardian Roles & Responsibilities" but is noted here for context).*
    *   **Member Association Process**: For an existing Family Federation, the official association of a new Member Nostr Account (NIP-05 and `npub`, provisioned as per sub-section B.1 with a key management model as per sub-section B.2) requires explicit approval by that Family Federation's guardian consensus. An administrative action, typically initiated by an existing guardian via the Dynastic platform, proposes the new member's `npub` and NIP-05 for association. This proposal is then subject to the Family Federation's established Fedimint multi-signature consensus process (e.g., 3/5 threshold).
    *   **Scope of Approved Membership**: Successful Fedimint guardian consensus on associating a member (i.e., adding their `npub` to the relevant Federation whitelist as per governance controls in Part A) formally "blesses" the member within that Family Federation. This typically grants the member:
        *   Official recognition of their NIP-05 identifier (on a Citadel-approved or Federation-managed domain) for use within the Dynastic ecosystem.
        *   Eligibility for an LNbits sub-account within the Family's section of the Citadel Hosted LNbits instance, allowing them to receive Cascade Payments and interact with the family treasury as per defined policies.
        *   Appropriate access credentials or permissions for the Family Federation's designated private Nostr relay(s).
        *   Membership in any associated NIP-172 community or other group structures representing the Family Federation.
        *   Other rights and privileges as defined by that Family Federation's specific operational policies.
    *   **Revocable Status**: Membership status and associated privileges are revocable by the same Fedimint guardian consensus mechanism that granted them.

4.  **Permissions, Controls, and Role-Based Access (RBAC)**:
    The Family Federation guardians, through Fedimint consensus, establish and enforce policies that define the permissions and controls for Member Accounts within the Dynastic ecosystem. These policies dictate the level of autonomy for members, particularly for Guardian-Custodied accounts, and govern access to federation-controlled resources for all members.

    *   **Scope of Permissions**: Permissions managed by the Federation can include, but are not limited to:
        *   **Publishing Rights**: Ability to publish Nostr events (e.g., notes, reactions, DMs) from their Member Account, potentially restricted to specific kinds, relays, or contexts (especially for Guardian-Custodied accounts).
        *   **Treasury Interactions**: Authorization to view family treasury balances, request payments from the Citadel Hosted LNbits wallet, or receive scheduled Cascade Payments.
        *   **Application Access**: Access to specific features or sections within the Dynastic client application or the Citadel Academy platform.
        *   **Data Access**: Permissions to view or contribute to shared family data stores (e.g., a family knowledge vault, if implemented).

    *   **Policy Definition & Enforcement**:
        *   Policies are defined by the Family Federation guardians and recorded in a verifiable manner (e.g., as a JSON object or structured data signed by Fedimint consensus and potentially published to a private Nostr relay or stored in the Dynastic platform's Supabase database).
        *   The Dynastic client application is responsible for fetching and enforcing these policies. For Guardian-Custodied accounts, the NIP-46 signer service also enforces these policies when processing requests.
        *   For Member-Held (self-sovereign) accounts, while the key is user-controlled, their ability to interact with *federation-controlled resources* (e.g., initiating LNbits operations, posting to specific private relays managed by the federation, accessing shared data) is governed by their `npub` being on federation whitelists and the policies associated with those whitelists and roles.

    *   **Distinction for Key Management Types**:
        *   **Guardian-Custodied Accounts**: Permissions are granularly enforced by the NIP-46 signer. All actions are inherently subject to the defined policies.
        *   **Member-Held Accounts**: Members have full control over their Nostr identity at the protocol level. However, their access to and interaction with Dynastic platform features, shared federation resources, and services like the Citadel Hosted LNbits are gated by federation-defined policies and whitelists applied to their `npub`.

    *   **Future RBAC Enhancements & Educational Credentialing**:
        *   The Dynastic platform plans to implement a comprehensive Role-Based Access Control (RBAC) system. This will allow for more fine-grained permissioning based on roles (e.g., "Parent," "Child," "Student," "Teacher/Mentor," "Family Office Admin").
        *   A key application of RBAC will be in educational credentialing within Citadel Academy. For instance:
            *   Each course will have one or more assigned "Teacher/Mentors."
            *   Upon a student's successful completion of coursework (proof of work), the designated Teacher/Mentor for that course will sign off on the achievement.
            *   A Citadel Academy Guardian (or a Family Federation Guardian with delegated authority) will then co-sign this attestation to officially issue a NIP-58 educational badge to the student. This co-signing process, managed via Fedimint consensus for Citadel Guardian actions, ensures the integrity and recognized value of badges issued within the Citadel Curriculum.
        *   This RBAC system will also leverage Fedimint consensus for defining roles, assigning roles to members, and managing permissions associated with those roles.

5.  **Event Recording & Audit Trail**:
    To ensure transparency, auditability, and robust record-keeping, all significant governance actions, member lifecycle events, credentialing processes, and policy modifications within the Dynastic platform and Family Federation operations are recorded as well-defined, structured Nostr events. These events are primarily published to the Family Federation's designated private Nostr relay(s), providing a verifiable and potentially replicable log. For enhanced querying and administrative efficiency, these events may also be indexed or mirrored in the Dynastic platform's Supabase database.

    Key recordable events include, but are not limited to:
    *   **Federation Governance**:
        *   Creation and updates to Family Federation policies (e.g., relay configurations, NIP-05 domain whitelists, member `npub` whitelists).
        *   Proposals and consensus outcomes for Fedimint guardian actions.
    *   **Member Lifecycle & Identity**:
        *   Private Membership Agreement (PMA) signing status.
        *   NIP-05 identifier provisioning and association with an `npub`.
        *   Selection and confirmation of key management options.
        *   Official association or disassociation of a member with the Family Federation.
        *   Key recovery events or changes in account access status.
    *   **Credentialing & Roles**:
        *   Issuance, revocation, or updates to educational badges (e.g., NIP-58) and other credentials.
        *   Assignment or changes to member roles within the RBAC system.
    *   **Treasury-Related Authorizations**: (To be further detailed in Section 2.2.2)
        *   Authorization of LNbits Cascade Payment configurations.
        *   Approvals for significant one-off payments or financial operations.

    This comprehensive event log serves as an essential administrative tool for guardians, provides members with a record of actions relevant to their participation, and underpins the overall integrity of the Family Federation's operations.

### 2.2.2 Citadel Hosted LNbits & Cascade Payments

The core mechanism for managing and distributing day-to-day family funds within the Dynastic ecosystem leverages a dedicated LNbits instance. This instance is initially hosted and maintained by Citadel Academy on its Start9 server infrastructure, providing a reliable and feature-rich Lightning accounting system for families. Family Federations interact with this Citadel Hosted LNbits instance under policies and authorizations governed by their respective Fedimint guardian consensus.

**A. Citadel Hosted LNbits Instance:**

*   **Infrastructure**: Citadel Academy operates an LNbits instance, accessible to authenticated Family Federations and their members through the Dynastic client. This instance is responsible for creating and managing Lightning Network wallets/accounts for families and individual members.
*   **Family Accounts within LNbits**: Each Family Federation approved to use the treasury system will have a primary "parent account" (or a set of logically grouped accounts) within the Citadel Hosted LNbits instance. This parent account holds the bulk of that family's operational Lightning funds. Member accounts (e.g., for children's allowances) are typically set up as sub-accounts or separate linked accounts that can be funded from this parent account.
