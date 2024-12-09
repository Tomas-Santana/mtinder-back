import { JwtPayload } from "jsonwebtoken";

// extend payload to include user

export interface JwtUser {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
}

interface JwtPayloadWithUser extends JwtPayload {
  user: JwtUser;
}

export default JwtPayloadWithUser;
