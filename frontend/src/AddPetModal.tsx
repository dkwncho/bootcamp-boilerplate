import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from "@mui/material";

export interface AddPetValues {
  name: string;
  breed: string;
  age?: number;
  url?: string;
}

interface AddPetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddPetValues) => void;
}

export default function AddPetModal({ open, onClose, onSubmit }: AddPetModalProps) {
  const [values, setValues] = React.useState<AddPetValues>({
    name: "",
    breed: "",
    age: undefined,
    url: "",
  });

  const handleChange = (field: keyof AddPetValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValues((prev) => ({
      ...prev,
      [field]: field === "age" ? (v === "" ? undefined : Number(v)) : v,
    }));
  };

  const handleSubmit = () => {
    onSubmit(values);
    onClose();
    // optional: reset after close
    setValues({ name: "", breed: "", age: undefined, url: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Pet</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" value={values.name} onChange={handleChange("name")} required autoFocus />
          <TextField label="Breed" value={values.breed} onChange={handleChange("breed")} required />
          <TextField
            label="Age (years)"
            type="number"
            value={values.age ?? ""}
            onChange={handleChange("age")}
            inputProps={{ min: 0 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
