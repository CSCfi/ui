<template>
  <div>
    <c-accordion>
      <c-accordion-item value="members">
        <div slot="header" class="member-header">
          <span>Members and roles</span>

          <span class="member-header-meta">3 pending invites</span>
        </div>

        <p>Invite members by email and assign them a role in the project.</p>
      </c-accordion-item>

      <c-accordion-item heading="Data storage" value="storage">
        <p>Allas object storage is available to every project by default.</p>
      </c-accordion-item>
    </c-accordion>
  </div>
</template>

<style>
/* Slotted header content is light DOM: style it with your own CSS. It
   inherits the header's text color, so it matches a plain `heading`. */
.member-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-weight: 500;
}

.member-header-meta {
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--c-on-surface-muted);
}
</style>
