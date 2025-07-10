class TeacherDTO {
  constructor({ id, first_name, last_name, email, phone, salary, image_url, created_at, updated_at }) {
    this.id = id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.email = email;
    this.phone = phone;
    this.salary = salary;
    this.imageUrl = image_url;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
  static fromRow(row) { return new TeacherDTO(row); }
}
module.exports = TeacherDTO;