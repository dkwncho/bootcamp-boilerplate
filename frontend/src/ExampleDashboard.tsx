import React, { useState, useEffect } from "react";
import "./ExampleDashboard.css";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import AddPetModal, { type AddPetValues } from "./AddPetModal";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { createPet, updatePet, getPets, deletePet } from "./ExampleApi";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import type { AlertProps } from "@mui/material/Alert";

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

type ExampleDashboardProps = {
  themeMode?: "light" | "dark";
  setThemeMode?: (m: "light" | "dark") => void;
};

function Header({
  searchQuery,
  setSearchQuery,
  themeMode,
  setThemeMode,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  themeMode?: "light" | "dark";
  setThemeMode?: (m: "light" | "dark") => void;
}) {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "flex-start", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700} component="div">
            Pawgrammers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin dashboard
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: { xs: "100%", sm: 360 } }}>
          <TextField
            fullWidth
            id="search-pet"
            label="Search pets"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {setThemeMode && (
            <IconButton onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")} aria-label="toggle-theme">
              {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function ExampleDashboard({ themeMode, setThemeMode }: ExampleDashboardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [petsList, setPetsList] = useState<any[]>([]);
  const [explodingIds, setExplodingIds] = useState<Set<string>>(new Set());
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: "success" | "error" }>({
    open: false,
    message: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    breed: "",
    age: "",
    url: "",
  });

  const handleAddPetClick = () => setIsAddPetOpen(true);
  const handleClose = () => setIsAddPetOpen(false);

  // Helper to extract a string id from different _id representations
  const extractId = (idField: any) => {
    if (!idField) return "";
    if (typeof idField === "string") return idField;
    if (idField.$oid) return idField.$oid;
    try {
      return String(idField);
    } catch (e) {
      return JSON.stringify(idField);
    }
  };

  const loadPets = async () => {
    try {
      const data = await getPets();
      if (Array.isArray(data)) {
        setPetsList(data.map((p: any) => ({ ...p })));
      } else {
        console.warn("getPets returned unexpected data:", data);
      }
    } catch (err) {
      console.error("Failed to load pets:", err);
      setSnack({ open: true, message: "Failed to load pets", severity: "error" });
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  // Optimistic add: quickly show temp item, then replace with server result (or refetch)
  const handleAddPetSubmit = async (values: AddPetValues) => {
    const tempId = `tmp-${Date.now()}`;
    const tempPet = { _id: tempId, ...values };
    setPetsList((prev) => [tempPet, ...prev]);
    try {
      const response = await createPet(values);
      if (response.status === 200) {
        await loadPets();
        setSnack({ open: true, message: "Pet added", severity: "success" });
      } else {
        throw new Error("Create failed");
      }
    } catch (err) {
      // rollback
      setPetsList((prev) => prev.filter((p) => extractId(p._id) !== tempId));
      setSnack({ open: true, message: "Failed to add pet", severity: "error" });
    }
  };

  // Optimistic delete: animate immediately, rollback on failure
  const handleDelete = async (pet: any) => {
    const petId = extractId(pet._id);
    setExplodingIds((prev) => new Set(prev).add(petId));
    setTimeout(() => {
      setPetsList((prev) => prev.filter((p) => extractId(p._id) !== petId));
    }, 200);
    try {
      const res = await deletePet(petId);
      if (!(res.status === 200 && (res.data.deletedCount === 1 || res.data.deletedCount === undefined))) {
        throw new Error("Delete did not report success");
      }
      setSnack({ open: true, message: "Pet deleted", severity: "success" });
    } catch (err) {
      await loadPets();
      setSnack({ open: true, message: "Failed to delete — restored", severity: "error" });
    } finally {
      setTimeout(() => {
        setExplodingIds((prev) => {
          const s = new Set(prev);
          s.delete(petId);
          return s;
        });
      }, 1100);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPet(null);
    setEditForm({ name: "", breed: "", age: "", url: "" });
  };

  const handleEditFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedPet) return;
    const petId = extractId(selectedPet._id);
    try {
      const response = await updatePet(petId, {
        name: editForm.name,
        breed: editForm.breed,
        age: editForm.age ? Number(editForm.age) : undefined,
        url: editForm.url,
      });

      if (response.status === 200) {
        await loadPets();
        handleCloseDialog();
        setSnack({ open: true, message: "Pet updated", severity: "success" });
      }
    } catch (error) {
      console.error("Failed to update pet:", error);
      setSnack({ open: true, message: "Failed to update", severity: "error" });
    }
  };

  const filteredPets = petsList.filter((pet: any) => (pet.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const petCards = filteredPets.map((pet: any) => {
    const idStr = extractId(pet._id);
    const isExploding = explodingIds.has(idStr);
    const imgUrl = pet.url;

    return (
      <div key={idStr} className="pet-grid-item">
        <Card className={`pet-card ${isExploding ? "explode-card" : ""}`} sx={{ height: "100%", position: "relative" }}>
          {imgUrl ? (
            <CardMedia
              component="img"
              sx={{ height: 220, objectFit: "cover" }}
              image={imgUrl}
              alt={pet.name || "pet"}
              loading="lazy"
              onError={(e: any) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/vite.svg";
              }}
            />
          ) : (
            <Box
              sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                No pet picture
              </Typography>
            </Box>
          )}
          <CardContent>
            <Typography gutterBottom variant="h6">
              {pet.name}
            </Typography>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {pet.breed}
              {pet.age ? `, ${pet.age} yrs` : ""}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              onClick={() => {
                setSelectedPet(pet);
                setEditForm({
                  name: pet.name || "",
                  breed: pet.breed || "",
                  age: pet.age ? pet.age.toString() : "",
                  url: pet.url || "",
                });
                setIsDialogOpen(true);
              }}
              size="small"
            >
              Modify
            </Button>
            <Button size="small" color="error" onClick={() => handleDelete(pet)}>
              Delete
            </Button>
          </CardActions>
          {isExploding && (
            <div className="bomb-explosion" aria-hidden>
              <div className="flash" />
              <div className="boom" />
              <div className="shards">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} style={{ ["--i" as any]: i } as React.CSSProperties} className="shard" />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  });

  return (
    <>
      <Container maxWidth="lg">
        <Box className="dashboard" sx={{ py: 4 }}>
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} themeMode={themeMode} setThemeMode={setThemeMode} />

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <div style={{ flex: 1 }} />
            <Button variant="contained" onClick={() => setIsAddPetOpen(true)}>
              Add Pet
            </Button>
          </div>

          <div className="pet-grid">{petCards}</div>

          <AddPetModal open={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} onSubmit={handleAddPetSubmit} />

          <Fab
            color="primary"
            aria-label="add"
            onClick={() => setIsAddPetOpen(true)}
            sx={{ position: "fixed", right: 24, bottom: 24 }}
          >
            <AddIcon />
          </Fab>

          <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Edit Pet
                </Typography>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Pet Name"
                  value={editForm.name}
                  onChange={handleEditFormChange("name")}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Breed"
                  value={editForm.breed}
                  onChange={handleEditFormChange("breed")}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Age"
                  value={editForm.age}
                  onChange={handleEditFormChange("age")}
                  type="number"
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Picture URL"
                  value={editForm.url}
                  onChange={handleEditFormChange("url")}
                />
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleEditSubmit}>
                  Save
                </Button>
              </CardActions>
            </Card>
          </Dialog>
        </Box>
      </Container>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity || "success"}>{snack.message}</Alert>
      </Snackbar>
    </>
  );
}

export default ExampleDashboard;
