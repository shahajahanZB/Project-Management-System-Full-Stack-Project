package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.TagDTO;

import java.util.List;

public interface TagService {

    List<TagDTO> getAllTags();
}