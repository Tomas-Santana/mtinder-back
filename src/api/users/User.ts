import User from "../../database/models/user";
import { Request, Response } from "express";
import JwtPayloadWithUser from "../../types/api/jwtPayload";

export const deleteUser = async (_req: Request, res: Response) => {
  const user = res.locals.user as JwtPayloadWithUser | undefined;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const id = user.user.id;
 
  if (!id) {
    res.status(400).json({ error: "Valid id not founded." });
    return;
  }

  try {
    
    const deleted = await User.findByIdAndDelete(id);
  
    if (!deleted) {
      res.status(404).json({ error: "User not found." });
      return;
    }
  
    res.status(200).json({ _id: deleted.id });

  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }


}

export const getUsers = async (_req: Request, res: Response) => {
  const { id } = _req.params
  try {
    const users = await User.findAll(id);
    res.status(200).json(users || []);
  } catch (err) {
    res.status(500).json({ error: "Internal server error." })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  
  const { _id, firstName, lastName, favoriteGenres } = req.body

  if(!_id || !firstName || !lastName || !favoriteGenres) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }

  const updateData: Partial<{ firstName: string; lastName: string; favoriteGenres: string[] }> ={};

  if(firstName) updateData.firstName = firstName;
  if(lastName) updateData.lastName = lastName;
  if(favoriteGenres) updateData.favoriteGenres = favoriteGenres;

  try {
    const updated = await User.findByIdAndUpdate(_id, updateData, { new: true });
    if(!updated) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    
    res.status(200).json({ _id: updated.id, firstName: updated.firstName, lastName: updated.lastName, favoriteGenres: updated.favoriteGenres});
  } catch(err) {
    res.status(500).json({ error: "Internal server error." })
  }
}