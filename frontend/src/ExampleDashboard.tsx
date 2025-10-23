import { useState, useEffect } from "react";
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

function Header({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <Box>
      <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
        Pawgrammers Admin Dashboard
      </Typography>
      <TextField
        fullWidth
        id="search-pet"
        label="Search for Pet"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

function ExampleDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [petsList, setPetsList] = useState<any[]>([]);
  const [explodingIds, setExplodingIds] = useState<Set<string>>(new Set());

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    breed: "",
    age: "",
    url: "",
  });

  const handleAddPetClick = () => setIsAddPetOpen(true);
  const handleClose = () => setIsAddPetOpen(false);

  const handleAddPetSubmit = async (values: AddPetValues) => {
    try {
      const response = await createPet(values);
      if (response.status === 200) {
        // After creating, re-fetch the pets from the server so IDs and data
        // are normalized and the UI reflects the DB state.
        await loadPets();
      }
    } catch (error) {
      console.error("Failed to create pet:", error);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPet(null);
    setEditForm({ name: "", breed: "", age: "", url: "" });
  };

  const handleEditSubmit = async () => {
    if (!selectedPet) return;

    // Extract the actual ID string from the _id object
    const petId = extractId(selectedPet._id);
    console.log("Extracted pet ID:", petId);

    try {
      const response = await updatePet(petId, {
        name: editForm.name,
        breed: editForm.breed,
        age: editForm.age ? Number(editForm.age) : undefined,
        url: editForm.url,
      });

      if (response.status === 200) {
        // After updating, re-fetch to keep data consistent
        await loadPets();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Failed to update pet:", error);
    }
  };

  const handleEditFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Helper to extract a string id from different _id representations
  const extractId = (idField: any) => {
    if (!idField) return "";
    if (typeof idField === "string") return idField;
    if (idField.$oid) return idField.$oid;
    // Fallback to string conversion
    try {
      return String(idField);
    } catch (e) {
      return JSON.stringify(idField);
    }
  };

  const handleDelete = async (pet: any) => {
    const petId = extractId(pet._id);
    try {
      const res = await deletePet(petId);
      // Expecting { deletedCount: 1 } from the server on success
      if (res.status === 200 && (res.data.deletedCount === 1 || res.data.deletedCount === undefined)) {
        // Play explosion animation then remove from UI
        setExplodingIds((prev) => {
          const s = new Set(prev);
          s.add(petId);
          return s;
        });
        const ANIM_MS = 1100;
        setTimeout(() => {
          setPetsList((prev) => prev.filter((p) => extractId(p._id) !== petId));
          setExplodingIds((prev) => {
            const s = new Set(prev);
            s.delete(petId);
            return s;
          });
        }, ANIM_MS);
      } else {
        console.warn("Delete did not remove any document:", res.data);
      }
    } catch (err) {
      console.error("Failed to delete pet:", err);
    }
  };

  // Load pets from backend and normalize IDs
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
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const filteredPets = petsList.filter((pet: any) => (pet.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  const petCards = filteredPets.map((pet: any) => {
    const idStr = extractId(pet._id);
    const isExploding = explodingIds.has(idStr);
    return (
      <div key={idStr} className="pet-grid-item">
        <Card className={`pet-card ${isExploding ? "explode-card" : ""}`} sx={{ height: "100%", position: "relative" }}>
          {pet.url ? (
            <CardMedia sx={{ height: 220 }} image={pet.url} />
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
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddPetClick}>
            Add Pet
          </Button>
          <div className="pet-grid">{petCards}</div>
          <AddPetModal open={isAddPetOpen} onClose={handleClose} onSubmit={handleAddPetSubmit} />
        </Box>
        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
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
      </Container>
    </>
  );
}

export default ExampleDashboard;
