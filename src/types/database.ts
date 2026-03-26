export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          id: string;
          sender_id: string;
          recipient_email: string;
          subject: string | null;
          body: string | null;
          is_starred: boolean;
          is_archived: boolean;
          is_deleted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_email: string;
          subject?: string | null;
          body?: string | null;
          is_starred?: boolean;
          is_archived?: boolean;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_email?: string;
          subject?: string | null;
          body?: string | null;
          is_starred?: boolean;
          is_archived?: boolean;
          is_deleted?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emails_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type EmailRow = Database["public"]["Tables"]["emails"]["Row"];
export type EmailInsert = Database["public"]["Tables"]["emails"]["Insert"];
