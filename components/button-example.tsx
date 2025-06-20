import { Button } from "@/components/ui/button-custom"

export default function ButtonExample() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-6">
      <h2 className="heading-2 mb-4 w-full">Button Examples</h2>

      <div className="flex gap-4">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    </div>
  )
}
