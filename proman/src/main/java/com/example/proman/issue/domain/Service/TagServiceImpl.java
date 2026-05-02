package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.TagDTO;
import com.example.proman.issue.domain.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<TagDTO> getAllTags() {

        return tagRepository.findAll()
                .stream()
                .map(tag -> TagDTO.builder()
                        .id(tag.getId())
                        .name(tag.getName())
                        .build())
                .collect(Collectors.toList());
    }
}