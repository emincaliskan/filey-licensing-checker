const EXEMPTIONS = [
  {
    id: "local_authority",
    label: "Property is let to or managed by a local authority housing department",
    description: "e.g. tenant is 'Hackney Council', 'Enfield Council', etc."
  },
  {
    id: "housing_association",
    label: "Property is let to a housing association or registered social landlord",
    description: "e.g. tenant is a registered provider of social housing"
  },
  {
    id: "management_order",
    label: "Property is subject to a management order",
    description: "Council has taken over management of the property"
  },
  {
    id: "owner_lodgers",
    label: "Property is occupied by the owner and up to 2 lodgers",
    description: "Owner-occupier with no more than 2 paying lodgers"
  },
  {
    id: "student_halls",
    label: "Student halls of residence managed by an educational institution",
    description: "Purpose-built student accommodation managed by a university or college"
  },
  {
    id: "religious_community",
    label: "Property is occupied by a religious community",
    description: "Occupied principally for religious purposes"
  },
  {
    id: "resident_landlord",
    label: "Resident landlord with no more than 2 tenants",
    description: "Landlord lives in the property with up to 2 tenants"
  }
];

export default EXEMPTIONS;
