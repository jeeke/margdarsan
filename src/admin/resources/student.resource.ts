import { ResourceWithOptions } from 'admin-bro';
import { Agent } from '../../agent/agent.entity';
import { Student } from "../../student/student.entity";

const StudentResource: ResourceWithOptions = {
  resource: Student,
  options: {},
};

export default StudentResource;