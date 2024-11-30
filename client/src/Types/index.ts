export interface ITodoTypes {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface INoteTypes {
  _id: string;
  title: string;
  content: string;
  isTodo: boolean;
  email: string;
  todos?: ITodoTypes[];
  isArchived: boolean;
  isTrashed: boolean;
}
