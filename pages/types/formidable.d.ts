// types/formidable.d.ts
import 'formidable';

declare module 'formidable' {
  interface IncomingForm {
    uploadDir?: string; // Add uploadDir property
  }
}
