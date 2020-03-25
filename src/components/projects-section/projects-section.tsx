import React, { MouseEvent, useEffect, useState } from "react";
import { IProject } from "../../contracts/projects/iproject";
import { ITag } from "../../contracts/tags/tag/itag";
import { GetAllProjects } from "../../hooks/projects/get-projects-graphql";
import { GetTagsGraphql } from "../../hooks/tags/get-tags-graphql";
import "./projects-section.scss";
import Projects from "./projects/projects";
import Tags from "./tags/tags";

const ProjectsSection = () => {

  /**
   * Gets and returns the list of selected tags.
   * @param {ITag[]} tags 
   * @returns {string[]}
   */
  const getSelectedTags = (tags: ITag[]): string[] => {
    return tags.map((tag: ITag) => tag.selected ? tag._id : null)
    .filter((result: string) => result !== null);
  }

  /**
   * Toggles the selected state of a tag/tags on tag click.
   * @param {MouseEvent} event 
   * @param {ITag} toggledTag 
   * @param {ITag[]} tags 
   * @returns {ITag[]}
   */
  const toggleTagState = (event: MouseEvent, toggledTag: ITag, tags: ITag[]): ITag[] => {
    event.persist();
    // If the view all tag is already selected, return the existing set of tags.
    if (toggledTag.isViewAll && toggledTag.selected) {
      return tags;
    }
    // If the toggled tag is the view all tag, get its new value, otherwise set to false.
    let newViewAllState: boolean = toggledTag.isViewAll ? !toggledTag.selected : false;
    setViewAllSelected(newViewAllState ? newViewAllState : false);
    let modifiedTags: ITag[] = tags.map((tag: ITag) => {
      // If the toggled tag is view all...
      if (toggledTag.isViewAll) {
        // And if the current tag is view all, set its new selected state.
        if (tag.isViewAll) {
          tag.selected = newViewAllState;
          return tag;
        }
        // If the current tag is not view all, set the new selected state of the tag.
        tag.selected = newViewAllState ? false : true;
        return tag;
      }
      // If the toggled tag is not view all...
      // but the current tag is view all and selected, set the view all tag to false since
      // we are selecting a different tag.
      if (tag.isViewAll && tag.selected) {
        tag.selected = false;
        return tag;
      }
      // and if the current tag is the tag being toggled, set its new selected state.
      if (tag._id === toggledTag._id) {
        tag.selected = !tag.selected;
      }
      // Return the tag.
      return tag;
    });
    // Set the selected tags.
    setSelectedTags(getSelectedTags(modifiedTags));
    // Return the modified set of tags.
    return modifiedTags;
  }

  const { allSanityTag } = GetTagsGraphql();
  const { allSanityProject } = GetAllProjects();
  const [projects, setProjects] = useState(allSanityProject.nodes);
  const [tags, setTags] = useState(allSanityTag.nodes);
  const [selectedTags, setSelectedTags] = useState(getSelectedTags(tags));
  const [viewAllSelected, setViewAllSelected] = useState(true);
  // When the selected tags or the view all state has changed, filter the projects based on the selected tags.
  useEffect(() => {
    setProjects(viewAllSelected ? allSanityProject.nodes : allSanityProject.nodes.filter((project: IProject) => {
      let includeProject: boolean = false;
      for (let tagIndex: number = 0; tagIndex < project.tags.length; tagIndex++) {
        if (selectedTags.includes(project.tags[tagIndex]._id)) {
          includeProject = true;
        }
      }
      return includeProject;
    }));
  }, [selectedTags, viewAllSelected]);
  return (
    <div className="projects-section-container">
      <Tags tags={tags} toggleTagState={(event: MouseEvent, tag: ITag) => setTags(toggleTagState(event, tag, tags))} />
      <Projects projects={projects}/>
    </div>
  );
}

export default ProjectsSection