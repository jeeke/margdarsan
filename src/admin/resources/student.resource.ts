import { ResourceWithOptions } from 'admin-bro';
import { Agent } from '../../entities/agent.entity';
import { Student } from "../../entities/student.entity";

const StudentResource: ResourceWithOptions = {
  resource: Student,
  options: {},
};

export default StudentResource;