import { Component, OnInit, PLATFORM_ID, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { isPlatformBrowser } from "@angular/common";
import { DatePipe } from "@angular/common";
import { Header } from "./header/header";

interface Note {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

@Component({
  selector: "app-root",
  imports: [FormsModule, Header, DatePipe],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  notes: Note[] = [];
  selectedNoteId: number | null = null;
  searchTerm = "";
  draftTitle = "";
  draftContent = "";

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedNotes = localStorage.getItem("my-notes");

      if (savedNotes) {
        try {
          this.notes = JSON.parse(savedNotes) as Note[];
        } catch {
          this.notes = [];
        }
      }
    }
  }

  get filteredNotes(): Note[] {
    const query = this.searchTerm.toLowerCase().trim();

    return this.notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query),
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  newNote(): void {
    this.selectedNoteId = null;
    this.draftTitle = "";
    this.draftContent = "";
  }

  selectNote(note: Note): void {
    this.selectedNoteId = note.id;
    this.draftTitle = note.title;
    this.draftContent = note.content;
  }

  saveNote(): void {
    const title = this.draftTitle.trim();

    if (!title) {
      alert("Please enter a title for your note.");
      return;
    }

    const now = new Date().toISOString();

    if (this.selectedNoteId !== null) {
      const existingNote = this.notes.find(
        (note) => note.id === this.selectedNoteId,
      );

      if (existingNote) {
        existingNote.title = title;
        existingNote.content = this.draftContent;
        existingNote.updatedAt = now;
      }
    } else {
      const note: Note = {
        id: Date.now(),
        title,
        content: this.draftContent,
        updatedAt: now,
      };

      this.notes.push(note);
      this.selectedNoteId = note.id;
    }

    this.persistNotes();
  }

  deleteNote(): void {
    if (this.selectedNoteId === null) return;

    const confirmed = confirm("Are you sure you want to delete this note?");

    if (!confirmed) return;

    this.notes = this.notes.filter((note) => note.id !== this.selectedNoteId);

    this.newNote();
    this.persistNotes();
  }

  private persistNotes(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem("my-notes", JSON.stringify(this.notes));
    }
  }
}
