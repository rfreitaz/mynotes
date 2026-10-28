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
  favorite: boolean;
  category: string;
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
  draftCategory = "Pessoal";
  categories = ["Pessoal", "Trabalho", "Estudo", "Outros"];
  showFavoritesOnly = false;
  selectedCategory = "Todas";

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
      this.notes = this.notes.map((note) => ({
        ...note,
        favorite: note.favorite ?? false,
        category: note.category ?? "Pessoal",
      }));
    }
  }
  saveStatus: "editing" | "saving" | "saved" = "editing";

  private saveStatusTimeout?: ReturnType<typeof setTimeout>;

  get filteredNotes(): Note[] {
    const query = this.searchTerm.toLowerCase().trim();

    return this.notes
      .filter((note) => {
        const matchesSearch =
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query);

        const matchesFavorites =
          !this.showFavoritesOnly || note.favorite === true;

        const matchesCategory =
          this.selectedCategory === "Todas" ||
          (note.category || "Pessoal") === this.selectedCategory;

        return matchesSearch && matchesFavorites && matchesCategory;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getSelectedNote(): Note | undefined {
    return this.notes.find((note) => note.id === this.selectedNoteId);
  }

  toggleFavorite(): void {
    const note = this.getSelectedNote();
    if (!note) return;

    note.favorite = !note.favorite;
    this.persistNotes();
  }

  newNote(): void {
    this.selectedNoteId = null;
    this.draftTitle = "";
    this.draftContent = "";
    this.draftCategory = "Pessoal";
  }

  selectNote(note: Note): void {
    this.selectedNoteId = note.id;
    this.draftTitle = note.title;
    this.draftContent = note.content;
    this.draftCategory = note.category ?? "Pessoal";
  }

  autoSaveNote(): void {
    if (!this.draftTitle.trim()) {
      return;
    }
    this.saveNote();
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
        existingNote.category = this.draftCategory;
      }
    } else {
      const note: Note = {
        id: Date.now(),
        title,
        content: this.draftContent,
        updatedAt: now,
        favorite: false,
        category: this.draftCategory,
      };

      this.notes.push(note);
      this.selectedNoteId = note.id;
    }

    this.saveStatus = "saving";
    this.persistNotes();

    if (this.saveStatusTimeout) {
      clearTimeout(this.saveStatusTimeout);
    }

    this.saveStatusTimeout = setTimeout(() => {
      this.saveStatus = "saved";
    }, 300);
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
