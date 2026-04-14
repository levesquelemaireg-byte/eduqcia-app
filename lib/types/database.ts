export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      cd: {
        Row: {
          code: string | null;
          competence: string;
          composante: string;
          critere: string;
          discipline_id: number;
          id: number;
        };
        Insert: {
          code?: string | null;
          competence: string;
          composante: string;
          critere: string;
          discipline_id: number;
          id?: number;
        };
        Update: {
          code?: string | null;
          competence?: string;
          composante?: string;
          critere?: string;
          discipline_id?: number;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cd_discipline_id_fkey";
            columns: ["discipline_id"];
            isOneToOne: false;
            referencedRelation: "disciplines";
            referencedColumns: ["id"];
          },
        ];
      };
      commentaires: {
        Row: {
          auteur_id: string;
          contenu: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          tae_id: string;
          updated_at: string;
        };
        Insert: {
          auteur_id: string;
          contenu: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          tae_id: string;
          updated_at?: string;
        };
        Update: {
          auteur_id?: string;
          contenu?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          tae_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "commentaires_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commentaires_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commentaires_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
      comportements: {
        Row: {
          enonce: string;
          id: string;
          nb_documents: number | null;
          oi_id: string;
          ordre: number;
          outil_evaluation: string;
          status: Database["public"]["Enums"]["oi_status"];
        };
        Insert: {
          enonce: string;
          id: string;
          nb_documents?: number | null;
          oi_id: string;
          ordre?: number;
          outil_evaluation: string;
          status?: Database["public"]["Enums"]["oi_status"];
        };
        Update: {
          enonce?: string;
          id?: string;
          nb_documents?: number | null;
          oi_id?: string;
          ordre?: number;
          outil_evaluation?: string;
          status?: Database["public"]["Enums"]["oi_status"];
        };
        Relationships: [
          {
            foreignKeyName: "comportements_oi_id_fkey";
            columns: ["oi_id"];
            isOneToOne: false;
            referencedRelation: "oi";
            referencedColumns: ["id"];
          },
        ];
      };
      connaissances: {
        Row: {
          discipline_id: number;
          enonce: string;
          id: number;
          realite_sociale: string;
          section: string;
          sous_section: string | null;
        };
        Insert: {
          discipline_id: number;
          enonce: string;
          id?: number;
          realite_sociale: string;
          section: string;
          sous_section?: string | null;
        };
        Update: {
          discipline_id?: number;
          enonce?: string;
          id?: number;
          realite_sociale?: string;
          section?: string;
          sous_section?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "connaissances_discipline_id_fkey";
            columns: ["discipline_id"];
            isOneToOne: false;
            referencedRelation: "disciplines";
            referencedColumns: ["id"];
          },
        ];
      };
      css: {
        Row: {
          created_at: string;
          gov_id: string;
          id: string;
          is_active: boolean;
          nom_court: string;
          nom_officiel: string;
          type_cs: Database["public"]["Enums"]["css_type"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          gov_id: string;
          id?: string;
          is_active?: boolean;
          nom_court: string;
          nom_officiel: string;
          type_cs: Database["public"]["Enums"]["css_type"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          gov_id?: string;
          id?: string;
          is_active?: boolean;
          nom_court?: string;
          nom_officiel?: string;
          type_cs?: Database["public"]["Enums"]["css_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      disciplines: {
        Row: {
          cd_json_file: string | null;
          code: string;
          conn_json_file: string | null;
          id: number;
          label: string;
        };
        Insert: {
          cd_json_file?: string | null;
          code: string;
          conn_json_file?: string | null;
          id?: number;
          label: string;
        };
        Update: {
          cd_json_file?: string | null;
          code?: string;
          conn_json_file?: string | null;
          id?: number;
          label?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          annee_normalisee: number | null;
          aspects_societe: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id: string;
          connaissances_ids: number[];
          created_at: string;
          disciplines_ids: number[];
          elements: Json;
          id: string;
          is_modified: boolean;
          is_published: boolean;
          niveaux_ids: number[];
          print_impression_scale: number;
          repere_temporel: string | null;
          source_document_id: string | null;
          source_version: number | null;
          structure: Database["public"]["Enums"]["document_structure"];
          titre: string;
          type: Database["public"]["Enums"]["doc_type"];
          updated_at: string;
          version: number;
        };
        Insert: {
          annee_normalisee?: number | null;
          aspects_societe?: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id: string;
          connaissances_ids?: number[];
          created_at?: string;
          disciplines_ids?: number[];
          elements?: Json;
          id?: string;
          is_modified?: boolean;
          is_published?: boolean;
          niveaux_ids?: number[];
          print_impression_scale?: number;
          repere_temporel?: string | null;
          source_document_id?: string | null;
          source_version?: number | null;
          structure?: Database["public"]["Enums"]["document_structure"];
          titre: string;
          type: Database["public"]["Enums"]["doc_type"];
          updated_at?: string;
          version?: number;
        };
        Update: {
          annee_normalisee?: number | null;
          aspects_societe?: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id?: string;
          connaissances_ids?: number[];
          created_at?: string;
          disciplines_ids?: number[];
          elements?: Json;
          id?: string;
          is_modified?: boolean;
          is_published?: boolean;
          niveaux_ids?: number[];
          print_impression_scale?: number;
          repere_temporel?: string | null;
          source_document_id?: string | null;
          source_version?: number | null;
          structure?: Database["public"]["Enums"]["document_structure"];
          titre?: string;
          type?: Database["public"]["Enums"]["doc_type"];
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "documents_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_source_document_id_fkey";
            columns: ["source_document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
      email_domains_whitelist: {
        Row: {
          created_at: string;
          domain: string;
          id: number;
          label: string | null;
        };
        Insert: {
          created_at?: string;
          domain: string;
          id?: number;
          label?: string | null;
        };
        Update: {
          created_at?: string;
          domain?: string;
          id?: number;
          label?: string | null;
        };
        Relationships: [];
      };
      evaluation_tae: {
        Row: {
          evaluation_id: string;
          id: string;
          ordre: number;
          tae_id: string;
        };
        Insert: {
          evaluation_id: string;
          id?: string;
          ordre?: number;
          tae_id: string;
        };
        Update: {
          evaluation_id?: string;
          id?: string;
          ordre?: number;
          tae_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluation_tae_evaluation_id_fkey";
            columns: ["evaluation_id"];
            isOneToOne: false;
            referencedRelation: "evaluations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluation_tae_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evaluation_tae_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
      evaluations: {
        Row: {
          auteur_id: string;
          created_at: string;
          description: string | null;
          id: string;
          is_archived: boolean;
          is_published: boolean;
          titre: string;
          updated_at: string;
        };
        Insert: {
          auteur_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_archived?: boolean;
          is_published?: boolean;
          titre: string;
          updated_at?: string;
        };
        Update: {
          auteur_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_archived?: boolean;
          is_published?: boolean;
          titre?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "evaluations_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      favoris: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          notes: string | null;
          type: Database["public"]["Enums"]["favori_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          notes?: string | null;
          type: Database["public"]["Enums"]["favori_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          notes?: string | null;
          type?: Database["public"]["Enums"]["favori_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favoris_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      niveaux: {
        Row: {
          code: string;
          cycle: number;
          id: number;
          label: string;
          ordre: number;
        };
        Insert: {
          code: string;
          cycle: number;
          id?: number;
          label: string;
          ordre: number;
        };
        Update: {
          code?: string;
          cycle?: number;
          id?: number;
          label?: string;
          ordre?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          is_read: boolean;
          payload: Json;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          payload?: Json;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_read?: boolean;
          payload?: Json;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      oi: {
        Row: {
          icone: string | null;
          id: string;
          ordre: number;
          status: Database["public"]["Enums"]["oi_status"];
          titre: string;
        };
        Insert: {
          icone?: string | null;
          id: string;
          ordre?: number;
          status?: Database["public"]["Enums"]["oi_status"];
          titre: string;
        };
        Update: {
          icone?: string | null;
          id?: string;
          ordre?: number;
          status?: Database["public"]["Enums"]["oi_status"];
          titre?: string;
        };
        Relationships: [];
      };
      profile_disciplines: {
        Row: {
          discipline_code: string;
          profile_id: string;
        };
        Insert: {
          discipline_code: string;
          profile_id: string;
        };
        Update: {
          discipline_code?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_disciplines_discipline_code_fkey";
            columns: ["discipline_code"];
            isOneToOne: false;
            referencedRelation: "disciplines";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "profile_disciplines_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_niveaux: {
        Row: {
          niveau_code: string;
          profile_id: string;
        };
        Insert: {
          niveau_code: string;
          profile_id: string;
        };
        Update: {
          niveau_code?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_niveaux_niveau_code_fkey";
            columns: ["niveau_code"];
            isOneToOne: false;
            referencedRelation: "niveaux";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "profile_niveaux_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          activated_at: string | null;
          activation_token: string | null;
          created_at: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          role: Database["public"]["Enums"]["user_role"];
          school_id: string | null;
          status: Database["public"]["Enums"]["activation_status"];
          updated_at: string;
          years_experience: number | null;
        };
        Insert: {
          activated_at?: string | null;
          activation_token?: string | null;
          created_at?: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          role?: Database["public"]["Enums"]["user_role"];
          school_id?: string | null;
          status?: Database["public"]["Enums"]["activation_status"];
          updated_at?: string;
          years_experience?: number | null;
        };
        Update: {
          activated_at?: string | null;
          activation_token?: string | null;
          created_at?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          school_id?: string | null;
          status?: Database["public"]["Enums"]["activation_status"];
          updated_at?: string;
          years_experience?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          },
        ];
      };
      schools: {
        Row: {
          created_at: string;
          css_id: string;
          gov_id: string;
          id: string;
          is_active: boolean;
          nom_officiel: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          css_id: string;
          gov_id: string;
          id?: string;
          is_active?: boolean;
          nom_officiel: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          css_id?: string;
          gov_id?: string;
          id?: string;
          is_active?: boolean;
          nom_officiel?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "schools_css_id_fkey";
            columns: ["css_id"];
            isOneToOne: false;
            referencedRelation: "css";
            referencedColumns: ["id"];
          },
        ];
      };
      tae: {
        Row: {
          aspects_societe: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id: string;
          cd_id: number | null;
          comportement_id: string | null;
          conception_mode: Database["public"]["Enums"]["conception_mode"];
          connaissances_ids: number[];
          consigne: string | null;
          consigne_search_plain: string | null;
          corrige: string | null;
          created_at: string;
          discipline_id: number | null;
          guidage: string | null;
          id: string;
          is_archived: boolean;
          is_published: boolean;
          last_major_trigger: string | null;
          nb_lignes: number | null;
          niveau_id: number | null;
          non_redaction_data: Json | null;
          oi_id: string | null;
          updated_at: string;
          version: number;
          version_updated_at: string | null;
        };
        Insert: {
          aspects_societe?: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id: string;
          cd_id?: number | null;
          comportement_id?: string | null;
          conception_mode?: Database["public"]["Enums"]["conception_mode"];
          connaissances_ids?: number[];
          consigne?: string | null;
          consigne_search_plain?: string | null;
          corrige?: string | null;
          created_at?: string;
          discipline_id?: number | null;
          guidage?: string | null;
          id?: string;
          is_archived?: boolean;
          is_published?: boolean;
          last_major_trigger?: string | null;
          nb_lignes?: number | null;
          niveau_id?: number | null;
          non_redaction_data?: Json | null;
          oi_id?: string | null;
          updated_at?: string;
          version?: number;
          version_updated_at?: string | null;
        };
        Update: {
          aspects_societe?: Database["public"]["Enums"]["aspect_societe"][];
          auteur_id?: string;
          cd_id?: number | null;
          comportement_id?: string | null;
          conception_mode?: Database["public"]["Enums"]["conception_mode"];
          connaissances_ids?: number[];
          consigne?: string | null;
          consigne_search_plain?: string | null;
          corrige?: string | null;
          created_at?: string;
          discipline_id?: number | null;
          guidage?: string | null;
          id?: string;
          is_archived?: boolean;
          is_published?: boolean;
          last_major_trigger?: string | null;
          nb_lignes?: number | null;
          niveau_id?: number | null;
          non_redaction_data?: Json | null;
          oi_id?: string | null;
          updated_at?: string;
          version?: number;
          version_updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tae_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_cd_id_fkey";
            columns: ["cd_id"];
            isOneToOne: false;
            referencedRelation: "cd";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_comportement_id_fkey";
            columns: ["comportement_id"];
            isOneToOne: false;
            referencedRelation: "comportements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_discipline_id_fkey";
            columns: ["discipline_id"];
            isOneToOne: false;
            referencedRelation: "disciplines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_niveau_id_fkey";
            columns: ["niveau_id"];
            isOneToOne: false;
            referencedRelation: "niveaux";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_oi_id_fkey";
            columns: ["oi_id"];
            isOneToOne: false;
            referencedRelation: "oi";
            referencedColumns: ["id"];
          },
        ];
      };
      tae_collaborateurs: {
        Row: {
          added_at: string;
          added_by: string | null;
          tae_id: string;
          user_id: string;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          tae_id: string;
          user_id: string;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          tae_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tae_collaborateurs_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_collaborateurs_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_collaborateurs_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_collaborateurs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tae_documents: {
        Row: {
          document_id: string;
          id: string;
          ordre: number;
          slot: string;
          tae_id: string;
        };
        Insert: {
          document_id: string;
          id?: string;
          ordre?: number;
          slot: string;
          tae_id: string;
        };
        Update: {
          document_id?: string;
          id?: string;
          ordre?: number;
          slot?: string;
          tae_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tae_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_documents_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_documents_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
      tae_usages: {
        Row: {
          added_to_eval: boolean;
          favorited: boolean;
          first_usage_at: string;
          id: string;
          pdf_downloaded: boolean;
          tae_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          added_to_eval?: boolean;
          favorited?: boolean;
          first_usage_at?: string;
          id?: string;
          pdf_downloaded?: boolean;
          tae_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          added_to_eval?: boolean;
          favorited?: boolean;
          first_usage_at?: string;
          id?: string;
          pdf_downloaded?: boolean;
          tae_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tae_usages_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_usages_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_usages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tae_versions: {
        Row: {
          archived_at: string;
          archived_by: string | null;
          cd_id: number | null;
          comportement_id: string | null;
          connaissances_ids: number[];
          consigne: string | null;
          guidage: string | null;
          id: string;
          oi_id: string | null;
          tae_id: string;
          version: number;
        };
        Insert: {
          archived_at?: string;
          archived_by?: string | null;
          cd_id?: number | null;
          comportement_id?: string | null;
          connaissances_ids?: number[];
          consigne?: string | null;
          guidage?: string | null;
          id?: string;
          oi_id?: string | null;
          tae_id: string;
          version: number;
        };
        Update: {
          archived_at?: string;
          archived_by?: string | null;
          cd_id?: number | null;
          comportement_id?: string | null;
          connaissances_ids?: number[];
          consigne?: string | null;
          guidage?: string | null;
          id?: string;
          oi_id?: string | null;
          tae_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tae_versions_archived_by_fkey";
            columns: ["archived_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_versions_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_versions_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
      tae_wizard_drafts: {
        Row: {
          id: string;
          payload: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          payload: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          payload?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tae_wizard_drafts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: {
          alignement_ministeriel: Database["public"]["Enums"]["vote_niveau"];
          clarte_consigne: Database["public"]["Enums"]["vote_niveau"];
          created_at: string;
          id: string;
          rigueur_historique: Database["public"]["Enums"]["vote_niveau"];
          tae_id: string;
          tae_version: number;
          updated_at: string;
          votant_id: string;
        };
        Insert: {
          alignement_ministeriel: Database["public"]["Enums"]["vote_niveau"];
          clarte_consigne: Database["public"]["Enums"]["vote_niveau"];
          created_at?: string;
          id?: string;
          rigueur_historique: Database["public"]["Enums"]["vote_niveau"];
          tae_id: string;
          tae_version: number;
          updated_at?: string;
          votant_id: string;
        };
        Update: {
          alignement_ministeriel?: Database["public"]["Enums"]["vote_niveau"];
          clarte_consigne?: Database["public"]["Enums"]["vote_niveau"];
          created_at?: string;
          id?: string;
          rigueur_historique?: Database["public"]["Enums"]["vote_niveau"];
          tae_id?: string;
          tae_version?: number;
          updated_at?: string;
          votant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_votant_id_fkey";
            columns: ["votant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      votes_archives: {
        Row: {
          alignement_ministeriel: Database["public"]["Enums"]["vote_niveau"];
          archived_at: string;
          clarte_consigne: Database["public"]["Enums"]["vote_niveau"];
          id: string;
          original_vote_id: string;
          rigueur_historique: Database["public"]["Enums"]["vote_niveau"];
          tae_id: string;
          tae_version: number;
          votant_id: string;
          voted_at: string;
        };
        Insert: {
          alignement_ministeriel: Database["public"]["Enums"]["vote_niveau"];
          archived_at?: string;
          clarte_consigne: Database["public"]["Enums"]["vote_niveau"];
          id?: string;
          original_vote_id: string;
          rigueur_historique: Database["public"]["Enums"]["vote_niveau"];
          tae_id: string;
          tae_version: number;
          votant_id: string;
          voted_at: string;
        };
        Update: {
          alignement_ministeriel?: Database["public"]["Enums"]["vote_niveau"];
          archived_at?: string;
          clarte_consigne?: Database["public"]["Enums"]["vote_niveau"];
          id?: string;
          original_vote_id?: string;
          rigueur_historique?: Database["public"]["Enums"]["vote_niveau"];
          tae_id?: string;
          tae_version?: number;
          votant_id?: string;
          voted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_archives_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_archives_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_archives_votant_id_fkey";
            columns: ["votant_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      banque_tae: {
        Row: {
          alignement_n1: number | null;
          alignement_n2: number | null;
          alignement_n3: number | null;
          apercu: string | null;
          aspects_societe: Database["public"]["Enums"]["aspect_societe"][] | null;
          auteur_css: string | null;
          auteur_ecole: string | null;
          auteur_id: string | null;
          auteur_nom: string | null;
          auteur_prenom: string | null;
          bank_popularity_score: number | null;
          cd_id: number | null;
          clarte_n1: number | null;
          clarte_n2: number | null;
          clarte_n3: number | null;
          comportement_enonce: string | null;
          comportement_id: string | null;
          connaissances_ids: number[] | null;
          consigne: string | null;
          consigne_search_plain: string | null;
          created_at: string | null;
          cycle: number | null;
          discipline_id: number | null;
          discipline_label: string | null;
          id: string | null;
          nb_documents: number | null;
          niveau_id: number | null;
          niveau_label: string | null;
          oi_id: string | null;
          oi_status: Database["public"]["Enums"]["oi_status"] | null;
          oi_titre: string | null;
          rigueur_n1: number | null;
          rigueur_n2: number | null;
          rigueur_n3: number | null;
          total_votants: number | null;
          updated_at: string | null;
          version: number | null;
          version_updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tae_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_cd_id_fkey";
            columns: ["cd_id"];
            isOneToOne: false;
            referencedRelation: "cd";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_comportement_id_fkey";
            columns: ["comportement_id"];
            isOneToOne: false;
            referencedRelation: "comportements";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_discipline_id_fkey";
            columns: ["discipline_id"];
            isOneToOne: false;
            referencedRelation: "disciplines";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_niveau_id_fkey";
            columns: ["niveau_id"];
            isOneToOne: false;
            referencedRelation: "niveaux";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tae_oi_id_fkey";
            columns: ["oi_id"];
            isOneToOne: false;
            referencedRelation: "oi";
            referencedColumns: ["id"];
          },
        ];
      };
      vote_counts: {
        Row: {
          alignement_n1: number | null;
          alignement_n2: number | null;
          alignement_n3: number | null;
          clarte_n1: number | null;
          clarte_n2: number | null;
          clarte_n3: number | null;
          rigueur_n1: number | null;
          rigueur_n2: number | null;
          rigueur_n3: number | null;
          tae_id: string | null;
          tae_version: number | null;
          total_votants: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
      vote_stats_author: {
        Row: {
          alignement_avg: number | null;
          alignement_n1: number | null;
          alignement_n2: number | null;
          alignement_n3: number | null;
          auteur_id: string | null;
          clarte_avg: number | null;
          clarte_n1: number | null;
          clarte_n2: number | null;
          clarte_n3: number | null;
          rigueur_avg: number | null;
          rigueur_n1: number | null;
          rigueur_n2: number | null;
          rigueur_n3: number | null;
          tae_id: string | null;
          tae_version: number | null;
          total_votants: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tae_auteur_id_fkey";
            columns: ["auteur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "banque_tae";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_tae_id_fkey";
            columns: ["tae_id"];
            isOneToOne: false;
            referencedRelation: "tae";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      apply_tae_collaborateurs_from_payload: {
        Args: {
          p_auteur: string;
          p_delete_existing: boolean;
          p_payload: Json;
          p_tae_id: string;
        };
        Returns: undefined;
      };
      auth_can_edit_tae: { Args: { p_tae_id: string }; Returns: boolean };
      auth_can_vote: { Args: { p_tae_id: string }; Returns: boolean };
      auth_is_active: { Args: never; Returns: boolean };
      auth_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      bump_tae_version: {
        Args: { p_tae_id: string; p_trigger_field: string };
        Returns: undefined;
      };
      delete_account_anonymize: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      get_field_version_type: {
        Args: { field_name: string };
        Returns: Database["public"]["Enums"]["version_trigger"];
      };
      inherit_metadata_to_source_doc: {
        Args: { p_document_id: string; p_tae_id: string };
        Returns: undefined;
      };
      publish_tae_transaction: { Args: { p_payload: Json }; Returns: string };
      record_tae_usage: {
        Args: {
          p_added_to_eval?: boolean;
          p_favorited?: boolean;
          p_pdf_downloaded?: boolean;
          p_tae_id: string;
        };
        Returns: undefined;
      };
      save_evaluation_composition: {
        Args: {
          p_evaluation_id: string;
          p_publish: boolean;
          p_tae_ids: string[];
          p_titre: string;
        };
        Returns: string;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      tae_user_can_access_for_document_link: {
        Args: { p_tae_id: string };
        Returns: boolean;
      };
      unaccent: { Args: { "": string }; Returns: string };
      update_tae_transaction: {
        Args: { p_payload: Json; p_tae_id: string };
        Returns: string;
      };
    };
    Enums: {
      activation_status: "pending" | "active" | "suspended";
      aspect_societe: "Économique" | "Politique" | "Social" | "Culturel" | "Territorial";
      conception_mode: "seul" | "equipe";
      css_type: "Franco" | "Anglo" | "Statut";
      doc_type: "textuel" | "iconographique";
      document_categorie_textuelle:
        | "documents_officiels"
        | "ecrits_personnels"
        | "presse_publications"
        | "discours_prises_parole"
        | "textes_savants"
        | "donnees_statistiques"
        | "textes_litteraires_culturels"
        | "autre";
      document_legend_position: "haut_gauche" | "haut_droite" | "bas_gauche" | "bas_droite";
      document_source_type: "primaire" | "secondaire";
      document_structure: "simple" | "perspectives" | "deux_temps";
      favori_type: "tae" | "document" | "evaluation";
      oi_status: "active" | "coming_soon";
      user_role: "enseignant" | "conseiller_pedagogique" | "admin";
      version_trigger: "minor_patch" | "major_bump";
      vote_niveau: "1" | "2" | "3";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activation_status: ["pending", "active", "suspended"],
      aspect_societe: ["Économique", "Politique", "Social", "Culturel", "Territorial"],
      conception_mode: ["seul", "equipe"],
      css_type: ["Franco", "Anglo", "Statut"],
      doc_type: ["textuel", "iconographique"],
      document_categorie_textuelle: [
        "documents_officiels",
        "ecrits_personnels",
        "presse_publications",
        "discours_prises_parole",
        "textes_savants",
        "donnees_statistiques",
        "textes_litteraires_culturels",
        "autre",
      ],
      document_legend_position: ["haut_gauche", "haut_droite", "bas_gauche", "bas_droite"],
      document_source_type: ["primaire", "secondaire"],
      document_structure: ["simple", "perspectives", "deux_temps"],
      favori_type: ["tae", "document", "evaluation"],
      oi_status: ["active", "coming_soon"],
      user_role: ["enseignant", "conseiller_pedagogique", "admin"],
      version_trigger: ["minor_patch", "major_bump"],
      vote_niveau: ["1", "2", "3"],
    },
  },
} as const;
