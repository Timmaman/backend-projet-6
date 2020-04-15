const Sauce = require('../models/sauces');
const fs = require('fs');
const regex = /[a-zA-Z]/;


// Ajouter une sauce
exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    if (!regex.test(sauceObject.name, sauceObject.manufacturer, sauceObject.description, sauceObject.mainPepper)) {
        res.status(401).json();
    } else {
        delete sauceObject._id;
        const sauce = new Sauce({
            ...sauceObject,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersdisLiked: []
        });
        sauce.save()
            .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
            .catch(error => res.status(400).json({ error }));
    }
};

// Afficher une sauce
exports.getOneSauce = (req, res) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({ error: error });
        }
    );
};

// Modifier une sauce
exports.modifySauce = (req, res) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
    if (!regex.test(sauceObject.name, sauceObject.manufacturer, sauceObject.description, sauceObject.mainPepper)) {
        res.status(401).json();
    } else {
        Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
            .then(
                () => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(
                (error) => {
                    res.status(400).json({ error });
                })
    }
};

// Supprimer une sauce
exports.deleteSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch((error) => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Afficher toutes les sauces
exports.getAllSauce = (req, res) => {
    Sauce.find()
        .then((sauces) => { res.status(200).json(sauces); })
        .catch((error) => { res.status(400).json({ error: error }); });
};

// Liker une sauce
exports.likeSauce = (req, res) => {
    const sauceLiked = req.file ? {
        ...JSON.parse(req.body.sauce),
    } : {...req.body };
    const like = sauceLiked.like;
    const userId = sauceLiked.userId
    if (like == 1) {
        Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: 1 },
                $push: { usersLiked: userId },
                $pull: { usersDisliked: userId }
            })
            .then(
                (sauce) => {
                    res.status(200).json(sauce);
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
    } else if (like == -1) {
        Sauce.updateOne({ _id: req.params.id }, {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: userId },
                $pull: { usersLiked: userId },
            })
            .then(
                (sauce) => {
                    res.status(200).json(sauce);
                }
            ).catch(
                (error) => {
                    res.status(400).json({
                        error: error
                    });
                }
            );
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                const test = sauce.usersDisliked.includes(userId)
                if (test == true) {
                    Sauce.updateOne({ _id: req.params.id }, {
                            $pull: { usersDisliked: userId },
                            $inc: { dislikes: -1 }
                        })
                        .then(
                            (sauce) => {
                                res.status(200).json(sauce);
                            }
                        ).catch(
                            (error) => {
                                res.status(400).json({
                                    error: error
                                });
                            }
                        );
                } else {
                    Sauce.updateOne({ _id: req.params.id }, {
                            $pull: { usersLiked: userId },
                            $inc: { likes: -1 }
                        })
                        .then(
                            (sauce) => {
                                res.status(200).json(sauce);
                            }
                        ).catch(
                            (error) => {
                                res.status(400).json({
                                    error: error
                                });
                            }
                        );
                }
            })
    }
};