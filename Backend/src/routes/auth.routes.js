import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { JWT_SECRET } from '../lib/constants.js';

const router = Router();
const JWT_EXPIRES_IN = '7d';

// ──────────────────────────────────────────────
// POST /register — Créer un compte
// ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, mot_de_pass } = req.body;

        if (!email || !mot_de_pass) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Vérifier si l'email existe déjà
        const existing = await prisma.utilisateur.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_pass, salt);

        // Créer l'utilisateur
        const user = await prisma.utilisateur.create({
            data: {
                nom: nom || null,
                prenom: prenom || null,
                email,
                mot_de_pass: hashedPassword,
            },
        });

        // Générer le token
        const token = jwt.sign(
            { id: user.identifiant, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: {
                identifiant: user.identifiant,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                date_creation: user.date_creation,
            },
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// ──────────────────────────────────────────────
// POST /login — Se connecter
// ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_pass } = req.body;

        if (!email || !mot_de_pass) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Trouver l'utilisateur
        const user = await prisma.utilisateur.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(mot_de_pass, user.mot_de_pass);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = jwt.sign(
            { id: user.identifiant, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                identifiant: user.identifiant,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                date_creation: user.date_creation,
            },
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// ──────────────────────────────────────────────
// GET /me — Profil de l'utilisateur connecté
// ──────────────────────────────────────────────
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.utilisateur.findUnique({
            where: { identifiant: req.user.id },
            select: {
                identifiant: true,
                nom: true,
                prenom: true,
                email: true,
                date_creation: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erreur get profile:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ──────────────────────────────────────────────
// PUT /me — Modifier le profil
// ──────────────────────────────────────────────
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, email } = req.body;

        // Si changement d'email, vérifier qu'il n'est pas déjà pris
        if (email) {
            const existing = await prisma.utilisateur.findUnique({ where: { email } });
            if (existing && existing.identifiant !== req.user.id) {
                return res.status(409).json({ error: 'Cet email est déjà utilisé' });
            }
        }

        const updated = await prisma.utilisateur.update({
            where: { identifiant: req.user.id },
            data: {
                ...(nom !== undefined && { nom }),
                ...(prenom !== undefined && { prenom }),
                ...(email !== undefined && { email }),
            },
            select: {
                identifiant: true,
                nom: true,
                prenom: true,
                email: true,
                date_creation: true,
            },
        });

        res.json({ message: 'Profil mis à jour', user: updated });
    } catch (error) {
        console.error('Erreur update profile:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ──────────────────────────────────────────────
// PUT /me/password — Changer le mot de passe
// ──────────────────────────────────────────────
router.put('/me/password', authenticateToken, async (req, res) => {
    try {
        const { ancien_mot_de_pass, nouveau_mot_de_pass } = req.body;

        if (!ancien_mot_de_pass || !nouveau_mot_de_pass) {
            return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
        }

        const user = await prisma.utilisateur.findUnique({
            where: { identifiant: req.user.id },
        });

        const validPassword = await bcrypt.compare(ancien_mot_de_pass, user.mot_de_pass);
        if (!validPassword) {
            return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nouveau_mot_de_pass, salt);

        await prisma.utilisateur.update({
            where: { identifiant: req.user.id },
            data: { mot_de_pass: hashedPassword },
        });

        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('Erreur change password:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ──────────────────────────────────────────────
// DELETE /me — Supprimer le compte
// ──────────────────────────────────────────────
router.delete('/me', authenticateToken, async (req, res) => {
    try {
        await prisma.utilisateur.delete({
            where: { identifiant: req.user.id },
        });

        res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        console.error('Erreur delete account:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

export default router;
