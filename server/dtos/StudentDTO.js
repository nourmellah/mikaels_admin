// dtos/StudentDTO.js
class StudentDTO {
  constructor({
    id, first_name, last_name, email, phone, group_id, level, has_cv, image_url, created_at, updated_at, wallet_balance
  }) {
    this.id = id;
    this.firstName = first_name;
    this.lastName = last_name;
    this.email = email;
    this.phone = phone;
    this.groupId = group_id;
    this.level = level;
    this.hasCv = has_cv;
    this.imageUrl = image_url;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
    this.walletBalance = wallet_balance ?? 0;
  }
  static fromRow(row) { return new StudentDTO(row); }
}
module.exports = StudentDTO;
