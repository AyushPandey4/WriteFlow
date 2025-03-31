'use client'
import WithSearchParams from "@/components/WithSearchParams"
import CreateArticle from "@/components/CreateArticle"

const CreateBlogs = () => {
  return (
    <div>
      <WithSearchParams fallback={<div>Loading editor...</div>}>
        <CreateArticle />
      </WithSearchParams>
    </div>
  )
}

export default CreateBlogs