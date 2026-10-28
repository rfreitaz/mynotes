import { Component } from "@angular/core";

@Component({
  selector: "app-header",
  imports: [],
  template: `
    <header class="topbar">
      <div class="brand-icon">N</div>
      <div class="brand-text">
        <strong>My Notes</strong>
        <span>YOUR PERSONAL SPACE</span>
      </div>
    </header>
  `,
  styleUrl: "./header.css",
})
export class Header {}
